package com.grind.backend.friendship;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

import com.grind.backend.user.UserDto;
import com.grind.backend.user.UserModel;
import com.grind.backend.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public FriendshipService(
            FriendshipRepository friendshipRepository,
            UserRepository userRepository
    ) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FriendshipDto sendFriendRequest(Long requesterId, String addresseeUsername) {
        UserModel requester = getUserById(requesterId);
        UserModel addressee = getUserByUsername(addresseeUsername);

        if (Objects.equals(requester.getId(), addressee.getId())) {
            throw new IllegalStateException("You cannot send a friend request to yourself");
        }

        friendshipRepository.findFriendshipBetweenUsers(requester, addressee)
                .ifPresent(existingFriendship -> {
                    throw new IllegalStateException("Friendship or friend request already exists");
                });

        FriendshipModel friendship = FriendshipModel.builder()
                .requester(requester)
                .addressee(addressee)
                .status(FriendshipStatus.PENDING)
                .build();

        FriendshipModel savedFriendship = friendshipRepository.save(friendship);

        return FriendshipDto.fromModel(savedFriendship);
    }

    @Transactional
    public FriendshipDto acceptFriendRequest(Long friendshipId, Long currentUserId) {
        FriendshipModel friendship = getFriendshipById(friendshipId);

        validateUserIsAddressee(friendship, currentUserId);

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new IllegalStateException("Only pending friend requests can be accepted");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);

        FriendshipModel savedFriendship = friendshipRepository.save(friendship);

        return FriendshipDto.fromModel(savedFriendship);
    }

    @Transactional
    public void rejectFriendRequest(Long friendshipId, Long currentUserId) {
        FriendshipModel friendship = getFriendshipById(friendshipId);

        validateUserIsAddressee(friendship, currentUserId);

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new IllegalStateException("Only pending friend requests can be rejected");
        }

        friendshipRepository.delete(friendship);
    }

    @Transactional
    public void removeFriend(Long currentUserId, String friendUsername) {
        UserModel currentUser = getUserById(currentUserId);
        UserModel friend = getUserByUsername(friendUsername);

        if (Objects.equals(currentUser.getId(), friend.getId())) {
            throw new IllegalStateException("You cannot remove yourself from friends");
        }

        FriendshipModel friendship = friendshipRepository
                .findFriendshipBetweenUsers(currentUser, friend)
                .orElseThrow(() -> new NoSuchElementException(
                        "Friendship between users does not exist"
                ));

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new IllegalStateException("Only accepted friendships can be removed");
        }

        friendshipRepository.delete(friendship);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getMyFriends(Long currentUserId) {
        UserModel currentUser = getUserById(currentUserId);

        return friendshipRepository
                .findAllByUserAndStatus(currentUser, FriendshipStatus.ACCEPTED)
                .stream()
                .map(friendship -> getOtherUser(friendship, currentUser))
                .map(UserDto::fromModel)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendshipDto> getReceivedPendingRequests(Long currentUserId) {
        UserModel currentUser = getUserById(currentUserId);

        return friendshipRepository
                .findByAddresseeAndStatus(currentUser, FriendshipStatus.PENDING)
                .stream()
                .map(FriendshipDto::fromModel)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendshipDto> getSentPendingRequests(Long currentUserId) {
        UserModel currentUser = getUserById(currentUserId);

        return friendshipRepository
                .findByRequesterAndStatus(currentUser, FriendshipStatus.PENDING)
                .stream()
                .map(FriendshipDto::fromModel)
                .toList();
    }

    private FriendshipModel getFriendshipById(Long friendshipId) {
        return friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Friendship with id " + friendshipId + " not found"
                ));
    }

    private UserModel getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException(
                        "User with id " + userId + " not found"
                ));
    }

    private UserModel getUserByUsername(String username) {
        if (username == null || username.trim().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        String normalizedUsername = username.trim();

        return userRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new NoSuchElementException(
                        "User with username " + normalizedUsername + " not found"
                ));
    }

    private void validateUserIsAddressee(FriendshipModel friendship, Long currentUserId) {
        Long addresseeId = friendship.getAddressee().getId();

        if (!Objects.equals(addresseeId, currentUserId)) {
            throw new SecurityException("Only the receiver can respond to this friend request");
        }
    }

    private UserModel getOtherUser(FriendshipModel friendship, UserModel currentUser) {
        if (Objects.equals(friendship.getRequester().getId(), currentUser.getId())) {
            return friendship.getAddressee();
        }

        return friendship.getRequester();
    }
}
package com.grind.backend.realtime;

import java.util.List;
import java.util.Objects;

import com.grind.backend.friendship.FriendshipModel;
import com.grind.backend.friendship.FriendshipRepository;
import com.grind.backend.friendship.FriendshipStatus;
import com.grind.backend.user.UserModel;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class RealtimeService {

    private final SimpMessagingTemplate messagingTemplate;
    private final FriendshipRepository friendshipRepository;

    public RealtimeService(
            SimpMessagingTemplate messagingTemplate,
            FriendshipRepository friendshipRepository
    ) {
        this.messagingTemplate = messagingTemplate;
        this.friendshipRepository = friendshipRepository;
    }

    public void publishHabitEventToUserAndFriends(
            UserModel actor,
            HabitRealtimeEvent event
    ) {
        sendToUser(actor.getId(), event);

        List<FriendshipModel> acceptedFriendships = friendshipRepository
                .findAllByUserAndStatus(actor, FriendshipStatus.ACCEPTED);

        acceptedFriendships.stream()
                .map(friendship -> getOtherUser(friendship, actor))
                .forEach(friend -> sendToUser(friend.getId(), event));
    }

    private void sendToUser(Long userId, HabitRealtimeEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/users/" + userId + "/dashboard",
                event
        );
    }

    private UserModel getOtherUser(FriendshipModel friendship, UserModel actor) {
        if (Objects.equals(friendship.getRequester().getId(), actor.getId())) {
            return friendship.getAddressee();
        }

        return friendship.getRequester();
    }
}
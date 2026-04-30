package com.grind.backend.friendship;

import java.util.List;
import java.util.Optional;

import com.grind.backend.user.UserModel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FriendshipRepository extends JpaRepository<FriendshipModel, Long> {

    Optional<FriendshipModel> findByRequesterAndAddressee(
            UserModel requester,
            UserModel addressee
    );

    @Query("""
            SELECT f FROM FriendshipModel f
            WHERE
                (f.requester = :userA AND f.addressee = :userB)
                OR
                (f.requester = :userB AND f.addressee = :userA)
            """)
    Optional<FriendshipModel> findFriendshipBetweenUsers(
            @Param("userA") UserModel userA,
            @Param("userB") UserModel userB
    );

    List<FriendshipModel> findByRequesterAndStatus(
            UserModel requester,
            FriendshipStatus status
    );

    List<FriendshipModel> findByAddresseeAndStatus(
            UserModel addressee,
            FriendshipStatus status
    );

    @Query("""
            SELECT f FROM FriendshipModel f
            WHERE
                (f.requester = :user OR f.addressee = :user)
                AND f.status = :status
            """)
    List<FriendshipModel> findAllByUserAndStatus(
            @Param("user") UserModel user,
            @Param("status") FriendshipStatus status
    );
}
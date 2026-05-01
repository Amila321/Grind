package com.grind.backend.dashboard;

import java.util.List;

public record DashboardResponse(
        DashboardUserResponse currentUser,
        List<DashboardUserResponse> friends
) {
}
package com.grind.backend.testnote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TestNoteRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title can have max 255 characters")
        String title,

        @Size(max = 1000, message = "Content can have max 1000 characters")
        String content
) {
}
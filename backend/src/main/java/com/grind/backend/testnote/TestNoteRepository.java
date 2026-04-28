package com.grind.backend.testnote;

import com.grind.backend.testnote.TestNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestNoteRepository extends JpaRepository<TestNote, Long> {
}
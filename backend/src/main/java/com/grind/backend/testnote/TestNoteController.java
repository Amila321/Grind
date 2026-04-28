package com.grind.backend.testnote;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-notes")
public class TestNoteController {

    private final TestNoteRepository testNoteRepository;

    public TestNoteController(TestNoteRepository testNoteRepository) {
        this.testNoteRepository = testNoteRepository;
    }

    @GetMapping
    public List<TestNote> getAllNotes() {
        return testNoteRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestNote> getNoteById(@PathVariable Long id) {
        return testNoteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TestNote> createNote(@Valid @RequestBody TestNoteRequest request) {
        TestNote note = new TestNote(request.title(), request.content());
        TestNote savedNote = testNoteRepository.save(note);

        return ResponseEntity
                .created(URI.create("/api/test-notes/" + savedNote.getId()))
                .body(savedNote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestNote> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody TestNoteRequest request
    ) {
        return testNoteRepository.findById(id)
                .map(existingNote -> {
                    existingNote.setTitle(request.title());
                    existingNote.setContent(request.content());

                    TestNote updatedNote = testNoteRepository.save(existingNote);

                    return ResponseEntity.ok(updatedNote);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        if (!testNoteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        testNoteRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
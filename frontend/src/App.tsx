import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import "./App.css";

type TestNote = {
    id: number;
    title: string;
    content: string | null;
    createdAt: string;
    updatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

function App() {
    const [notes, setNotes] = useState<TestNote[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [statusMessage, setStatusMessage] = useState("");

    async function loadNotes() {
        try {
            const response = await fetch(`${API_URL}/api/test-notes`);

            if (!response.ok) {
                throw new Error("Nie udało się pobrać notatek");
            }

            const data: TestNote[] = await response.json();
            setNotes(data);
            setStatusMessage("Połączono z backendem i bazą danych.");
        } catch (error) {
            setStatusMessage(
                error instanceof Error ? error.message : "Nieznany błąd"
            );
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!title.trim()) {
            setStatusMessage("Tytuł jest wymagany.");
            return;
        }

        const payload = {
            title,
            content,
        };

        const url =
            editingNoteId === null
                ? `${API_URL}/api/test-notes`
                : `${API_URL}/api/test-notes/${editingNoteId}`;

        const method = editingNoteId === null ? "POST" : "PUT";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Operacja zapisu nie powiodła się");
            }

            setTitle("");
            setContent("");
            setEditingNoteId(null);
            setStatusMessage(
                editingNoteId === null
                    ? "Dodano notatkę."
                    : "Zaktualizowano notatkę."
            );

            await loadNotes();
        } catch (error) {
            setStatusMessage(
                error instanceof Error ? error.message : "Nieznany błąd"
            );
        }
    }

    function startEditing(note: TestNote) {
        setEditingNoteId(note.id);
        setTitle(note.title);
        setContent(note.content ?? "");
    }

    function cancelEditing() {
        setEditingNoteId(null);
        setTitle("");
        setContent("");
    }

    async function deleteNote(id: number) {
        try {
            const response = await fetch(`${API_URL}/api/test-notes/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Nie udało się usunąć notatki");
            }

            setStatusMessage("Usunięto notatkę.");
            await loadNotes();
        } catch (error) {
            setStatusMessage(
                error instanceof Error ? error.message : "Nieznany błąd"
            );
        }
    }

    useEffect(() => {
        async function fetchNotes() {
            try {
                const response = await fetch(`${API_URL}/api/test-notes`);
                if (!response.ok) {
                    throw new Error("Nie udało się pobrać notatek");
                }
                const data: TestNote[] = await response.json();
                setNotes(data);
                setStatusMessage("Połączono z backendem i bazą danych.");
            } catch (error) {
                setStatusMessage(
                    error instanceof Error ? error.message : "Nieznany błąd"
                );
            }
        }

        fetchNotes();
    }, []);


    return (
        <main style={{ maxWidth: "760px", margin: "60px auto", fontFamily: "Arial" }}>
            <h1>Grind — TestNote CRUD</h1>

            <p>
                Ten ekran testuje pełną ścieżkę:
                <strong> React → Spring Boot → MySQL</strong>
            </p>

            <p>
                Status: <strong>{statusMessage}</strong>
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: "32px" }}>
                <div style={{ marginBottom: "12px" }}>
                    <label>
                        Tytuł
                        <br />
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Np. Testowa notatka"
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label>
                        Treść
                        <br />
                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Np. Sprawdzam zapis do MySQL"
                            rows={4}
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </label>
                </div>

                <button type="submit">
                    {editingNoteId === null ? "Dodaj notatkę" : "Zapisz zmiany"}
                </button>

                {editingNoteId !== null && (
                    <button type="button" onClick={cancelEditing} style={{ marginLeft: "8px" }}>
                        Anuluj edycję
                    </button>
                )}
            </form>

            <section style={{ marginTop: "40px" }}>
                <h2>Notatki z MySQL</h2>

                {notes.length === 0 ? (
                    <p>Brak notatek.</p>
                ) : (
                    notes.map((note) => (
                        <article
                            key={note.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "16px",
                                marginBottom: "12px",
                            }}
                        >
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>

                            <small>
                                ID: {note.id} | Created: {new Date(note.createdAt).toLocaleString()}
                            </small>

                            <div style={{ marginTop: "12px" }}>
                                <button onClick={() => startEditing(note)}>Edytuj</button>

                                <button
                                    onClick={() => deleteNote(note.id)}
                                    style={{ marginLeft: "8px" }}
                                >
                                    Usuń
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </section>
        </main>
    );
}

export default App;
import re
from typing import List

def chunk_text(text: str, chunk_size: int = 350, chunk_overlap: int = 50) -> List[str]:
    """
    Split text into ~300-500 word/token chunks with slight overlap on sentence boundaries
    as specified in BUILD_BRIEF.md §4.2.
    """
    text = text.strip()
    if not text:
        return []

    # Split into sentences using punctuation boundaries
    sentences = re.split(r'(?<=[.!?\n])\s+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    chunks: List[str] = []
    current_chunk: List[str] = []
    current_word_count = 0

    for sentence in sentences:
        words = sentence.split()
        sentence_word_count = len(words)

        if current_word_count + sentence_word_count > chunk_size and current_chunk:
            # Commit current chunk
            chunk_str = " ".join(current_chunk)
            chunks.append(chunk_str)

            # Keep last few sentences for overlap
            overlap_words = 0
            overlap_chunk = []
            for s in reversed(current_chunk):
                s_words = len(s.split())
                if overlap_words + s_words <= chunk_overlap:
                    overlap_chunk.insert(0, s)
                    overlap_words += s_words
                else:
                    break
            current_chunk = overlap_chunk
            current_word_count = overlap_words

        current_chunk.append(sentence)
        current_word_count += sentence_word_count

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

import re
from typing import List, Dict
from app.models.schemas import Claim

MERMAID_CLASS_DEFS = (
    "    classDef verified fill:#e6f4ea,stroke:#1e7e34,stroke-width:2px;\n"
    "    classDef inferred fill:#fff8e1,stroke:#b8860b,stroke-width:2px,stroke-dasharray:4 2;\n"
    "    classDef contested fill:#fdf0ff,stroke:#8e44ad,stroke-width:2px,stroke-dasharray:2 2;\n"
    "    classDef unsupported fill:#fdecea,stroke:#c0392b,stroke-width:2px,stroke-dasharray:4 2;\n"
)

def style_mermaid_diagram(diagram: str, claims: List[Claim]) -> str:
    """
    Styles Mermaid flowchart nodes with status colors (PRODUCTION_HARDENING_BRIEF.md §6.5.3):
    - solid green for verified
    - dashed amber for inferred
    - striped purple for contested
    - dashed red for unsupported
    """
    if not diagram or not isinstance(diagram, str):
        return diagram

    # Strip existing classDef or class statements to prevent duplication
    clean_lines = []
    for line in diagram.strip().split("\n"):
        stripped = line.strip()
        if not (stripped.startswith("classDef ") or (stripped.startswith("class ") and ";" in stripped)):
            clean_lines.append(line)
    
    clean_diagram = "\n".join(clean_lines)

    # Extract node IDs and labels from diagram
    # Matches patterns like NodeId[Label], NodeId(Label), NodeId{Label}, NodeId[(Label)]
    node_pattern = re.compile(r'([a-zA-Z0-9_]+)\s*(?:\[\[?|\(\(?|\{\{?)(.*?)(?:\]\]?|\)\)?|\}\}?)')
    found_nodes: Dict[str, str] = {} # node_id -> label
    
    for match in node_pattern.finditer(clean_diagram):
        nid = match.group(1).strip()
        label = match.group(2).strip()
        # Avoid keywords like 'subgraph', 'end', 'graph', 'flowchart'
        if nid.lower() not in {"subgraph", "end", "graph", "flowchart", "click", "class", "style", "classdef"}:
            found_nodes[nid] = label

    if not found_nodes:
        return clean_diagram

    # Determine status for each node
    node_classes = []
    for nid, label in found_nodes.items():
        node_status = "inferred" # Default to inferred for architectural components
        label_words = set(re.findall(r'\w+', label.lower()))
        id_words = set(re.findall(r'\w+', nid.lower()))

        best_match_claim = None
        best_score = 0

        for c in claims:
            claim_words = set(re.findall(r'\w+', c.text.lower()))
            overlap = len((label_words | id_words).intersection(claim_words))
            if overlap > best_score:
                best_score = overlap
                best_match_claim = c

        if best_match_claim and best_score >= 1:
            node_status = best_match_claim.status
        elif claims:
            # Fallback based on majority of verified vs inferred claims
            verified_count = sum(1 for c in claims if c.status == "verified")
            if verified_count > len(claims) / 2:
                node_status = "verified"

        node_classes.append(f"    class {nid} {node_status};")

    result = f"{clean_diagram}\n\n{MERMAID_CLASS_DEFS}" + "\n".join(node_classes)
    return result

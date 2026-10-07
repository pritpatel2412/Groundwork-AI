import re
from typing import List, Dict
from app.models.schemas import Claim
from app.agents.data import sanitize_mermaid_erd

MERMAID_CLASS_DEFS = (
    "    classDef verified fill:#e6f4ea,stroke:#1e7e34,stroke-width:2px;\n"
    "    classDef inferred fill:#fff8e1,stroke:#b8860b,stroke-width:2px,stroke-dasharray:4 2;\n"
    "    classDef contested fill:#fdf0ff,stroke:#8e44ad,stroke-width:2px,stroke-dasharray:2 2;\n"
    "    classDef unsupported fill:#fdecea,stroke:#c0392b,stroke-width:2px,stroke-dasharray:4 2;\n"
)

MERMAID_ER_CLASS_DEFS = (
    "  classDef verified fill:#e6f4ea,stroke:#1e7e34,stroke-width:2px\n"
    "  classDef inferred fill:#fff8e1,stroke:#b8860b,stroke-width:2px,stroke-dasharray:4 2\n"
    "  classDef contested fill:#fdf0ff,stroke:#8e44ad,stroke-width:2px,stroke-dasharray:2 2\n"
    "  classDef unsupported fill:#fdecea,stroke:#c0392b,stroke-width:2px,stroke-dasharray:4 2\n"
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

        node_classes.append(f"    class {nid} {node_status}")

    result = f"{clean_diagram}\n\n{MERMAID_CLASS_DEFS}" + "\n".join(node_classes)
    return result

def style_mermaid_er_diagram(diagram: str, claims: List[Claim]) -> str:
    """
    Styles Mermaid ER Diagram entities with status colors (PRODUCTION_HARDENING_BRIEF.md §6.5.3).
    Injects classDef and class assignments without semicolons (as required by Mermaid ER grammar).
    """
    if not diagram or not isinstance(diagram, str):
        return diagram

    clean_diagram = sanitize_mermaid_erd(diagram)

    # Strip any existing classDef or class statements to prevent duplication
    clean_lines = []
    for line in clean_diagram.strip().split("\n"):
        stripped = line.strip()
        if not (stripped.startswith("classDef ") or stripped.startswith("class ")):
            clean_lines.append(line)

    clean_diagram = "\n".join(clean_lines)

    # Extract all entity names
    found_entities = set()
    for line in clean_diagram.split("\n"):
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("erDiagram") or trimmed.startswith("%%"):
            continue
        rel_match = re.match(r'([A-Za-z0-9_]+)\s*(?:\|\||\}\||\|o|\}o|\}\{\||\}\{|\.\.|\-\-)\S*\s*([A-Za-z0-9_]+)', trimmed)
        if rel_match:
            found_entities.add(rel_match.group(1))
            found_entities.add(rel_match.group(2))
        else:
            block_match = re.match(r'([A-Za-z0-9_]+)\s*\{', trimmed)
            if block_match:
                found_entities.add(block_match.group(1))

    reserved = {"erdiagram", "title", "classdef", "class", "direction", "acc_title", "acc_descr"}
    valid_entities = [e for e in sorted(list(found_entities)) if e.lower() not in reserved]

    if not valid_entities:
        return clean_diagram

    entity_classes = []
    for entity in valid_entities:
        entity_words = set(re.findall(r'\w+', entity.lower()))
        node_status = "inferred"
        best_match_claim = None
        best_score = 0

        for c in claims:
            claim_words = set(re.findall(r'\w+', c.text.lower()))
            overlap = len(entity_words.intersection(claim_words))
            if overlap > best_score:
                best_score = overlap
                best_match_claim = c

        if best_match_claim and best_score >= 1:
            node_status = best_match_claim.status
        elif claims:
            verified_count = sum(1 for c in claims if c.status == "verified")
            if verified_count > len(claims) / 2:
                node_status = "verified"

        entity_classes.append(f"  class {entity} {node_status}")

    return f"{clean_diagram}\n\n{MERMAID_ER_CLASS_DEFS}" + "\n".join(entity_classes)

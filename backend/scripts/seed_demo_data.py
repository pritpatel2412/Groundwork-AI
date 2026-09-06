import os
import sys

# Ensure backend directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.client import db_client
from app.routes.ingestion import process_and_save_document

def seed_demo_workspaces():
    print("=== Seeding GroundWork AI Demo Datasets ===")

    base_demo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo_data"))

    # 1. Normal Case Workspace
    ws_normal = db_client.create_workspace("Demo: Procurement Automation (Normal Case)")
    sop_file = os.path.join(base_demo_dir, "normal_case", "sop_procurement.txt")
    if os.path.exists(sop_file):
        with open(sop_file, "r", encoding="utf-8") as f:
            text = f.read()
        doc = process_and_save_document(
            workspace_id=ws_normal.id,
            raw_text=text,
            filename="sop_procurement.txt",
            source_type="document"
        )
        print(f" [+] Normal case seeded in workspace '{ws_normal.name}' (ID: {ws_normal.id})")

    # 2. Difficult Case Workspace (Contradiction Test)
    ws_diff = db_client.create_workspace("Demo: Policy Discrepancy (Difficult Case)")
    diff_file = os.path.join(base_demo_dir, "difficult_case", "messy_transcript.txt")
    if os.path.exists(diff_file):
        with open(diff_file, "r", encoding="utf-8") as f:
            text = f.read()
        doc = process_and_save_document(
            workspace_id=ws_diff.id,
            raw_text=text,
            filename="messy_transcript.txt",
            source_type="voice_transcript"
        )
        print(f" [+] Difficult case seeded in workspace '{ws_diff.name}' (ID: {ws_diff.id})")

    # 3. Edge Case Workspace (OCR / Scanned)
    ws_edge = db_client.create_workspace("Demo: Legacy Archival Memo (Edge Case)")
    edge_file = os.path.join(base_demo_dir, "edge_case", "scanned_legacy_memo.txt")
    if os.path.exists(edge_file):
        with open(edge_file, "r", encoding="utf-8") as f:
            text = f.read()
        doc = process_and_save_document(
            workspace_id=ws_edge.id,
            raw_text=text,
            filename="scanned_legacy_memo.txt",
            source_type="screenshot_ocr"
        )
        print(f" [+] Edge case seeded in workspace '{ws_edge.name}' (ID: {ws_edge.id})")

    print("\nAll demo workspaces seeded successfully!")

if __name__ == "__main__":
    seed_demo_workspaces()

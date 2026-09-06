import urllib.request
import json
import time
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

WS_NORMAL_ID = "25504771-844a-4df8-b5fb-13d1d8bd9a72"
WS_DIFF_ID = "a7003377-fb95-4470-a2a5-89f09709ffba"
WS_EDGE_ID = "a8e7604f-0090-4982-8c4e-cc87be1a6a3b"

def test_workspace(ws_id, case_name):
    print(f"\n=======================================================", flush=True)
    print(f"TESTING SCENARIO: {case_name}", flush=True)
    print(f"Workspace ID: {ws_id}", flush=True)
    print(f"=======================================================", flush=True)

    url = f"http://127.0.0.1:8000/workspaces/{ws_id}/generate"
    req = urllib.request.Request(url, method="POST")

    start_time = time.time()
    events = []
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            print("Connected to SSE Stream. Receiving agent traces...", flush=True)
            for raw_line in resp:
                line = raw_line.decode("utf-8").strip()
                if line.startswith("data:"):
                    payload = json.loads(line[5:].strip())
                    events.append(payload)
                    stage = payload.get("stage", "")
                    status = payload.get("status", "")
                    msg = payload.get("message", "")
                    print(f"  [{stage.upper():<18}] ({status:<7}) -> {msg}", flush=True)
    except Exception as e:
        print(f"Error during SSE generation stream: {e}", flush=True)
        return False

    elapsed = round(time.time() - start_time, 2)
    print(f"\nPipeline finished in {elapsed}s. Total events: {len(events)}", flush=True)

    # 1. Check Requirements
    req_url = f"http://127.0.0.1:8000/workspaces/{ws_id}/requirements"
    with urllib.request.urlopen(req_url) as r:
        requirements = json.loads(r.read().decode())
    print(f"\n1. REQUIREMENTS VALIDATION (Total: {len(requirements)}):", flush=True)
    for idx, req in enumerate(requirements, 1):
        status_tag = f"[{req['status'].upper()}]"
        cits = req['citations']
        print(f"   {idx}. {status_tag:<13} {req['text'][:80]}... (Citations: {len(cits)})", flush=True)
        if req.get('explanation'):
            print(f"      -> Verifier Audit: {req['explanation']}", flush=True)

    # 2. Check Contradictions
    cont_url = f"http://127.0.0.1:8000/workspaces/{ws_id}/contradictions"
    with urllib.request.urlopen(cont_url) as r:
        contradictions = json.loads(r.read().decode())
    print(f"\n2. CONTRADICTIONS DETECTED: {len(contradictions)}", flush=True)
    for c in contradictions:
        print(f"   [!] CONTRADICTION SURFACED: {c['description']}", flush=True)

    # 3. Check Architecture Artifact
    arch_url = f"http://127.0.0.1:8000/workspaces/{ws_id}/artifacts/architecture"
    with urllib.request.urlopen(arch_url) as r:
        arch = json.loads(r.read().decode())
    diagram = arch.get("content", {}).get("diagram", "")
    is_mermaid_text = diagram.strip().startswith("graph") or diagram.strip().startswith("flowchart")
    print(f"\n3. ARCHITECTURE MERMAID TEXT INVARIANT: {'PASS (Mermaid text format)' if is_mermaid_text else 'FAIL'}", flush=True)
    print(f"   Preview:\n   " + "\n   ".join(diagram.split("\n")[:4]), flush=True)

    # 4. Check Wireframe Artifact
    wf_url = f"http://127.0.0.1:8000/workspaces/{ws_id}/artifacts/wireframe"
    with urllib.request.urlopen(wf_url) as r:
        wf = json.loads(r.read().decode())
    screens = wf.get("content", {}).get("screens", [])
    print(f"\n4. WIREFRAME SCREENS GENERATED: {len(screens)}", flush=True)
    for s in screens:
        print(f"   - Screen '{s.get('title')}': {len(s.get('elements', []))} interactive elements", flush=True)

    # 5. Check Estimator
    est_url = f"http://127.0.0.1:8000/workspaces/{ws_id}/artifacts/estimate"
    with urllib.request.urlopen(est_url) as r:
        est = json.loads(r.read().decode())
    est_data = est.get("content", {}).get("estimate", {})
    print(f"\n5. ESTIMATION RANGE (CLAUDE.md Non-Single Number Invariant):", flush=True)
    print(f"   - Optimistic: {est_data.get('optimistic_weeks')} weeks", flush=True)
    print(f"   - Realistic:  {est_data.get('realistic_weeks')} weeks", flush=True)
    print(f"   - Pessimistic:{est_data.get('pessimistic_weeks')} weeks", flush=True)
    print(f"   - Cost Range: {est_data.get('cost_estimate_usd')}", flush=True)
    print(f"   - Calibration: {est_data.get('calibrated_reference')}", flush=True)

    # 6. Check Verifier Summary
    sum_url = f"http://127.0.0.1:8000/workspaces/{ws_id}/claims/summary"
    with urllib.request.urlopen(sum_url) as r:
        summary = json.loads(r.read().decode())
    print(f"\n6. VERIFIER SUMMARY & GROUNDING RATE:", flush=True)
    print(f"   - Total Audited Claims: {summary['total_claims']}", flush=True)
    print(f"   - Verified Claims:      {summary['verified_count']}", flush=True)
    print(f"   - Inferred Claims:      {summary['inferred_count']}", flush=True)
    print(f"   - Unsupported Claims:   {summary['unsupported_count']}", flush=True)
    print(f"   - Grounding Rate:       {summary['grounded_rate_percent']}%", flush=True)

    # 7. Check Human Confirmation Export Invariant
    export_url = f"http://127.0.0.1:8000/workspaces/{ws_id}/export"
    try:
        req_unauth = urllib.request.Request(export_url, data=json.dumps({"human_confirmed": False}).encode(), headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req_unauth)
        export_blocked = False
    except urllib.error.HTTPError as err:
        export_blocked = (err.code == 400)

    req_auth = urllib.request.Request(export_url, data=json.dumps({"human_confirmed": True}).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req_auth) as r:
        export_data = json.loads(r.read().decode())
    export_success = bool(export_data.get("markdown"))

    print(f"\n7. EXPORT HUMAN CONFIRMATION INVARIANT (CLAUDE.md §2.4):", flush=True)
    print(f"   - Auto-publish without confirmation blocked: {'PASS (HTTP 400 rejected)' if export_blocked else 'FAIL'}", flush=True)
    print(f"   - Export with confirmation allowed:          {'PASS (Markdown blueprint generated)' if export_success else 'FAIL'}", flush=True)

    return True

if __name__ == "__main__":
    print("STARTING COMPLETE QUALITY ASSURANCE TEST SUITE...", flush=True)
    # Test 1: Normal Case
    test_workspace(WS_NORMAL_ID, "Normal Case (Procurement SOP)")
    # Test 2: Difficult Case
    test_workspace(WS_DIFF_ID, "Difficult Case (Policy Discrepancy / Contradiction $1,000 vs $5,000)")
    # Test 3: Edge Case
    test_workspace(WS_EDGE_ID, "Edge Case (Legacy Archival Scanned Memo)")

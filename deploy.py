#!/usr/bin/env python3
"""
Good Results — Batch Deploy to GitHub

Pushes multiple files to the 2wice23/goodresults repo in a SINGLE commit
using the Git Trees/Blobs API. Netlify auto-deploys from there.

Usage:
    python3 deploy.py "commit message" file1 file2 file3 ...
    python3 deploy.py "commit message" --all-modules
    python3 deploy.py "commit message" --glob "gimmebrain/module*.html"

The --all-modules flag pushes all 12 module HTML files.
The --glob flag accepts a glob pattern relative to the repo root.
"""

import urllib.request, json, base64, sys, os, glob as globmod

TOKEN = os.environ.get('GITHUB_PAT', '')
REPO = '2wice23/goodresults'
API = f'https://api.github.com/repos/{REPO}'
LOCAL_ROOT = os.path.dirname(os.path.abspath(__file__))
BRANCH = 'main'

def api_request(path, method='GET', data=None):
    """Make an authenticated GitHub API request."""
    url = f'{API}/{path}' if not path.startswith('http') else path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method, headers={
        'Authorization': f'token {TOKEN}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    })
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

def get_head_commit():
    """Get the SHA of the current HEAD commit and its tree."""
    ref = api_request(f'git/ref/heads/{BRANCH}')
    commit_sha = ref['object']['sha']
    commit = api_request(f'git/commits/{commit_sha}')
    return commit_sha, commit['tree']['sha']

def create_blob(content_bytes):
    """Create a blob in the repo and return its SHA."""
    b64 = base64.b64encode(content_bytes).decode()
    blob = api_request('git/blobs', method='POST', data={
        'content': b64,
        'encoding': 'base64'
    })
    return blob['sha']

def create_tree(base_tree_sha, file_entries):
    """Create a new tree with the given file entries on top of the base tree."""
    tree_items = []
    for path, blob_sha in file_entries:
        tree_items.append({
            'path': path,
            'mode': '100644',
            'type': 'blob',
            'sha': blob_sha
        })
    tree = api_request('git/trees', method='POST', data={
        'base_tree': base_tree_sha,
        'tree': tree_items
    })
    return tree['sha']

def create_commit(tree_sha, parent_sha, message):
    """Create a new commit pointing to the given tree."""
    commit = api_request('git/commits', method='POST', data={
        'message': message,
        'tree': tree_sha,
        'parents': [parent_sha]
    })
    return commit['sha']

def update_ref(commit_sha):
    """Update the branch ref to point to the new commit."""
    api_request(f'git/refs/heads/{BRANCH}', method='PATCH', data={
        'sha': commit_sha
    })

def resolve_files(args):
    """Parse CLI args into a list of repo-relative file paths."""
    files = []
    i = 0
    while i < len(args):
        if args[i] == '--all-modules':
            for n in range(1, 13):
                files.append(f'gimmebrain/module{n}.html')
            i += 1
        elif args[i] == '--glob':
            pattern = args[i + 1]
            full_pattern = os.path.join(LOCAL_ROOT, pattern)
            matches = sorted(globmod.glob(full_pattern))
            for m in matches:
                rel = os.path.relpath(m, LOCAL_ROOT)
                files.append(rel)
            i += 2
        else:
            files.append(args[i])
            i += 1
    return files

def deploy(message, file_paths):
    """Push multiple files in a single commit."""
    print(f'Deploying {len(file_paths)} file(s)...')
    print(f'Commit message: {message}')
    print()

    # Step 1: Get current HEAD
    head_sha, tree_sha = get_head_commit()
    print(f'Current HEAD: {head_sha[:10]}')

    # Step 2: Create blobs for each file
    entries = []
    for repo_path in file_paths:
        local_path = os.path.join(LOCAL_ROOT, repo_path)
        if not os.path.exists(local_path):
            print(f'  SKIP (not found): {repo_path}')
            continue
        with open(local_path, 'rb') as f:
            content = f.read()
        blob_sha = create_blob(content)
        entries.append((repo_path, blob_sha))
        size_kb = len(content) / 1024
        print(f'  Blob: {repo_path} ({size_kb:.1f} KB)')

    if not entries:
        print('No files to deploy.')
        return

    # Step 3: Create new tree
    new_tree_sha = create_tree(tree_sha, entries)
    print(f'\nNew tree: {new_tree_sha[:10]}')

    # Step 4: Create commit
    new_commit_sha = create_commit(new_tree_sha, head_sha, message)
    print(f'New commit: {new_commit_sha[:10]}')

    # Step 5: Update branch ref
    update_ref(new_commit_sha)
    print(f'\n✓ Pushed {len(entries)} file(s) in 1 commit. Netlify will auto-deploy.')

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python3 deploy.py "commit message" file1 [file2 ...] [--all-modules] [--glob "pattern"]')
        sys.exit(1)

    message = sys.argv[1]
    file_paths = resolve_files(sys.argv[2:])

    if not file_paths:
        print('No files specified.')
        sys.exit(1)

    deploy(message, file_paths)

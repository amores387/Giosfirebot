from flask import Blueprint, request, jsonify
import re
import requests
import os
from logger import log


bp = Blueprint('reel', __name__)


HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-us,en;q=0.5',
    'Sec-Fetch-Mode': 'navigate',
}


def get_og(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    
    match = re.search(r'<meta property="og:video" content="([^"]+)"', r.text)
    if not match:
        raise Exception("og:video not found")
        
    return match.group(1).replace('&amp;', '&')


def dl_vid(og_url: str, filepath: str):
    os.makedirs(os.path.dirname(filepath) or '.', exist_ok=True)
    
    with requests.get(og_url, headers=HEADERS, stream=True, timeout=300) as r:
        r.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)


@bp.route('/reel/download', methods=['POST'])
def download_route():
    req = request.get_json(force=True, silent=True)
    log(req)
    
    payload = req.get('data', {})
    url = payload.get('url')
    path = payload.get('path')
    
    if not url or not path:
        return jsonify({'success': False, 'value': None, 'msg': '⚠️ Missing url or path'}), 400
    
    try:
        og_url = get_og(url)
        dl_vid(og_url, path)
        return jsonify({'success': True, 'value': path, 'msg': None})
        
    except Exception as e:
        return jsonify({'success': False, 'value': None, 'msg': f'⚠️ {str(e)}'}), 500


@bp.route('/reel/delete', methods=['POST'])
def delete_route():
    req = request.get_json(force=True, silent=True)
    log(req)
    
    payload = req.get('data', {})
    path = payload.get('path')
    
    if not path:
        return jsonify({'success': False, 'value': None, 'msg': '⚠️ Missing path'}), 400
    
    try:
        if os.path.exists(path):
            os.remove(path)
            return jsonify({'success': True, 'value': path, 'msg': None})
            
        return jsonify({'success': False, 'value': None, 'msg': '⚠️ File not found'}), 404
        
    except Exception as e:
        return jsonify({'success': False, 'value': None, 'msg': f'⚠️ {str(e)}'}), 500
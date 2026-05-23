from flask import Blueprint, request, jsonify
from logger import log
from decimal import getcontext
from wrapper import Decimal


getcontext().prec = 100_000
bp = Blueprint('sort', __name__)


@bp.route('/sort', methods=['POST'])
def sort_route():
    req = request.get_json(force=True, silent=True)
    log(req)
    payload = req.get('data') or {}

    arr = payload.get('array', [])
    key = payload.get('key', 0)
    reversed_flag = payload.get('reversed', False)

    if not isinstance(arr, list):
        return jsonify({'success': False, 'result': [], 'msg': '⚠️ array must be a list'})

    if not all(isinstance(x, (list, tuple)) for x in arr):
        return jsonify({'success': False, 'result': [], 'msg': '⚠️ array items must be tuples/lists'})

    try:
        key = int(key)
        reversed_flag = bool(reversed_flag)
        
    except:
        return jsonify({'success': False, 'result': [], 'msg': '⚠️ key must be int, reversed must be bool'})

    try:
        decimal_arr = []
        for item in arr:
            if key >= len(item):
                return jsonify({'success': False, 'result': [], 'msg': f'⚠️ key {key} out of range'})
            decimal_arr.append((Decimal(str(item[key])), item))
            
    except:
        return jsonify({'success': False, 'result': [], 'msg': '⚠️ Invalid numbers at key index'})
        
    decimal_arr.sort(key=lambda x: x[0], reverse=reversed_flag)

    result = [original for _, original in decimal_arr]

    return jsonify({
        'success': True,
        'result': result,
        'msg': None,
        'count': len(result),
        'key': key,
        'reversed': reversed_flag
    })
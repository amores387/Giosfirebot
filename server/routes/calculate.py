from flask import Blueprint, request, jsonify
from wrapper import Decimal
from decimal import getcontext
from logger import log


getcontext().prec = 100000
bp = Blueprint('calculate', __name__)


def format_num(result) -> str:
    if result == 0:
        return "0"
        
    if result <= 1_000_000:
        num = result.normalize()
        if num == num.to_integral_value():
            return f"{int(num):,}"
            
        else:
            return f"{num:,}"
            
    return f"{result:.2e}"


def calculate(bal: str, operation: str, offset: str):
    try:
        num_bal = Decimal(bal)
        num_offset = Decimal(offset)
        
    except:
        return {'success': False, 'value': None, 'msg': '⚠️ Invalid numbers'}

    if operation == 'add':
        result = num_bal + num_offset
        
    elif operation == 'sub':
        result = num_bal - num_offset
        
    elif operation == 'mul':
        result = num_bal * num_offset
        
    elif operation == 'div':
        if num_offset == 0:
            return {'success': False, 'value': None, 'msg': '⚠️ Division by zero'}
            
        result = num_bal // num_offset
        
    else:
        return {'success': False, 'value': None, 'msg': '⚠️ Invalid operation'}

    if result < 0:
        result = Decimal(0)

    value_str = format_num(result)
    return {'success': True, 'value': value_str, 'msg': None}


@bp.route('/calculate/singel', methods=['POST'])
def calculate_route():
    req = request.get_json(force=True, silent=True)
    log(req)
    
    payload = req.get('data', {})
    result = calculate(
        bal=payload.get('bal', '0'),
        operation=payload.get('operation', 'add'),
        offset=payload.get('offset', '0')
    )
    
    return jsonify(result)


@bp.route('/calculate/multi', methods=['POST'])
def calc_batch():
    req = request.get_json(force=True, silent=True)
    log(req)
    
    payload = req.get('data', {})
    pairs = payload.get('pairs', [])
    op = payload.get('op', 'add')

    if not isinstance(pairs, list):
        return jsonify({
            'success': False,
            'results': [],
            'msg': '⚠️ pairs must be array'
        }), 400

    results = []
    for pair in pairs:
        if not isinstance(pair, (list, tuple)) or len(pair) != 2:
            results.append("0")
            continue
        
        a, b = pair
        res = calculate(bal=str(a), operation=op, offset=str(b))
        
        if res['success']:
            results.append(res['value'])
            
        else:
            results.append("0")

    return jsonify({
        'success': True,
        'results': results,
        'msg': None,
        'count': len(results)
    })
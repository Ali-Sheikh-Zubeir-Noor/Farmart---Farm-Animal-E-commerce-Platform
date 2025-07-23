from math import ceil

def paginate_query(query, page=1, per_page=10):
    """
    Paginate a SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-based)
        per_page: Items per page
    
    Returns:
        dict: Contains items and pagination info
    """
    # Get total count
    total = query.count()
    
    # Calculate offset
    offset = (page - 1) * per_page
    
    # Get items for current page
    items = query.offset(offset).limit(per_page).all()
    
    # Calculate pagination info
    total_pages = ceil(total / per_page)
    has_prev = page > 1
    has_next = page < total_pages
    
    return {
        'items': items,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages,
            'has_prev': has_prev,
            'has_next': has_next,
            'prev_page': page - 1 if has_prev else None,
            'next_page': page + 1 if has_next else None
        }
    }
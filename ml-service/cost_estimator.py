"""
FixNearby Repair Cost Estimator (Baseline Heuristic & ML Model Interface)
Provides transparent indicative price ranges with uncertainty bounds.
"""

def estimate_repair_cost(category: str, urgency: str = 'medium', location_tier: str = 'tier2') -> dict:
    base_ranges = {
        'Electrician': (300, 1500),
        'Plumber': (250, 1200),
        'AC Technician': (500, 3000),
        'Appliance Repair': (350, 2200),
        'Carpenter': (400, 2500),
        'Painter': (800, 6000),
    }

    min_price, max_price = base_ranges.get(category, (300, 1500))

    if urgency == 'emergency':
        min_price = int(min_price * 1.3)
        max_price = int(max_price * 1.4)
    elif urgency == 'high':
        min_price = int(min_price * 1.15)
        max_price = int(max_price * 1.2)

    return {
        'category': category,
        'urgency': urgency,
        'indicative_range': {
            'min': min_price,
            'max': max_price,
            'currency': 'INR',
        },
        'disclaimer': 'Indicative estimate range only. Final price determined by provider custom quotation.',
    }

if __name__ == '__main__':
    result = estimate_repair_cost('Electrician', urgency='emergency')
    print("Sample Cost Estimation Output:")
    print(result)

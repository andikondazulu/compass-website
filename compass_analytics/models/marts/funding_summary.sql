select
    programme,
    region,
    count(*) as grant_count,
    sum(committed) as total_committed,
    sum(disbursed) as total_disbursed,
    sum(committed - disbursed) as remaining_funding,
    round(
        100.0 * sum(disbursed) / nullif(sum(committed), 0),
        2
    ) as disbursement_rate_pct,
    count(*) filter (where status = 'At risk') as at_risk_grants,
    count(*) filter (where status = 'Completed') as completed_grants
from {{ ref('stg_grants') }}
group by programme, region

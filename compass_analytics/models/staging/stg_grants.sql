select
    id as grant_id,
    trim(organisation) as organisation,
    trim(programme) as programme,
    trim(region) as region,
    cast(committed as decimal(12, 2)) as committed,
    cast(disbursed as decimal(12, 2)) as disbursed,
    trim(status) as status,
    cast(start_date as date) as start_date
from {{ ref('grants') }}

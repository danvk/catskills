from dataclasses import dataclass
from pathlib import Path
from typing import Optional


BLOG_ROOT = Path(__file__).parent

peaks = [
    'Slide',
    'Wittenberg',
    'Cornell',
    'Friday',
    'Balsam Cap',
    'Rocky',
    'Lone',
    'Table',
    'Peekamoose',
    'Panther',
    'Balsam',
    'Eagle',
    'Big Indian',
    'Fir',
    'Balsam Lake',
    'Bearpen',
    'Vly',
    'Halcott',
    'North Dome',
    'Mount Sherrill',
    'Rusk',
    'Westkill',
    'Southwest Hunter',
    'Hunter',
    'Plateau',
    'Sugarloaf',
    'Indian Head',
    'Twin',
    'Blackhead',
    'Black Dome',
    'Thomas Cole',
    'Windham',
    'Kaaterskill High Peak',
]

@dataclass
class Peak:
    name: str
    rank: int
    height_ft: int
    type: str
    alt_name: Optional[str] = None


peak_details = [
    Peak(rank=1, name='Slide Mountain', height_ft=4180, type='Trailed', alt_name='Slide'),
    Peak(rank=2, name='Hunter', height_ft=4040, type='Trailed'),
    Peak(rank=3, name='Black Dome', height_ft=3980, type='Trailed'),
    Peak(rank=4, name='Thomas Cole', height_ft=3940, type='Trailed'),
    Peak(rank=5, name='Blackhead', height_ft=3940, type='Trailed'),
    Peak(rank=6, name='Westkill', height_ft=3880, type='Trailed'),
    Peak(rank=7, name='Cornell', height_ft=3860, type='Trailed'),
    Peak(rank=8, name='Table', height_ft=3847, type='Trailed'),
    Peak(rank=9, name='Peekamoose', height_ft=3843, type='Trailed'),
    Peak(rank=10, name='Plateau', height_ft=3840, type='Trailed'),
    Peak(rank=11, name='Sugarloaf', height_ft=3800, type='Trailed'),
    Peak(rank=12, name='Wittenberg', height_ft=3780, type='Trailed'),
    Peak(rank=13, name='Southwest Hunter', height_ft=3740, type='Untrailed'),
    Peak(rank=14, name='Balsam Lake Mountain', height_ft=3723, type='Trailed', alt_name='Balsam Lake'),
    Peak(rank=15, name='Lone', height_ft=3721, type='Untrailed'),
    Peak(rank=16, name='Panther', height_ft=3720, type='Trailed'),
    Peak(rank=17, name='Big Indian', height_ft=3700, type='Trailed'),
    Peak(rank=18, name='Friday', height_ft=3694, type='Untrailed'),
    Peak(rank=19, name='Rusk', height_ft=3680, type='Untrailed'),
    Peak(rank=20, name='Kaaterskill High Peak', height_ft=3655, type='Untrailed'),
    Peak(rank=21, name='Twin', height_ft=3640, type='Trailed'),
    Peak(rank=22, name='Balsam Cap', height_ft=3623, type='Untrailed'),
    Peak(rank=23, name='Fir', height_ft=3620, type='Untrailed'),
    Peak(rank=24, name='North Dome', height_ft=3610, type='Untrailed'),
    Peak(rank=25, name='Eagle', height_ft=3600, type='Trailed'),
    Peak(rank=26, name='Balsam', height_ft=3600, type='Trailed'),
    Peak(rank=27, name='Bearpen', height_ft=3600, type='Trailed'),
    Peak(rank=28, name='Indian Head', height_ft=3573, type='Trailed'),
    Peak(rank=29, name='Mount Sherrill', height_ft=3540, type='Untrailed'),
    Peak(rank=30, name='Halcott', height_ft=3537, type='Untrailed'),
    Peak(rank=31, name='Vly', height_ft=3529, type='Untrailed'),
    Peak(rank=32, name='Windham High Peak', height_ft=3524, type='Trailed', alt_name='Windham'),
    Peak(rank=33, name='Rocky', height_ft=3487, type='Untrailed'),
]

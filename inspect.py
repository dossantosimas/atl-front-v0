from pathlib import Path
path = Path('components/quality_v0/micro/kpi-weekly.tsx')
with path.open('r', encoding='utf-8') as f:
    lines = f.readlines()
for i in range(570, 595):
    print(i+1, repr(lines[i]))

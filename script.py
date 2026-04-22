from pathlib import Path
path = Path('components/quality_v0/micro/kpi-weekly.tsx')
with path.open('r', encoding='utf-8') as f:
    data = f.read()
needle = "import { useToast } from \"@/components/toast\";\nimport {\n  Tooltip,\n  TooltipContent,\n  TooltipProvider,\n  TooltipTrigger,\n} from \"@/components/ui/tooltip\";\n"
if needle not in data:
    raise SystemExit('needle not found')
replacement = needle + "import { highlightIfNonZero } from \"@/components/quality_v0/micro/highlight\";\n"
with path.open('w', encoding='utf-8', newline='') as f:
    f.write(data.replace(needle, replacement, 1))

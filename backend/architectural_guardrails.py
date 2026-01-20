"""
Architectural Guardrails for MVTPS
Prevents violations of the established architecture patterns.
"""

import ast
import os
import sys
from typing import List, Dict, Any

class ArchitecturalGuardrails:
    """Enforces architectural rules and patterns"""
    
    # Forbidden patterns in views
    FORBIDDEN_VIEW_PATTERNS = [
        'objects.filter',
        'objects.get',
        'objects.create',
        'objects.update',
        'objects.delete',
        'objects.all',
        'objects.count',
        'objects.aggregate',
        'objects.annotate',
        'select_related',
        'prefetch_related',
        'Q(',
        'F(',
    ]
    
    # Required patterns in views
    REQUIRED_VIEW_PATTERNS = [
        'Service.',  # Must use service layer
    ]
    
    # Forbidden sync patterns in external APIs
    FORBIDDEN_SYNC_PATTERNS = [
        'requests.get',
        'requests.post',
        'urllib.request',
        'httpx.get',
        'httpx.post',
    ]
    
    @classmethod
    def check_view_compliance(cls, file_path: str) -> List[Dict[str, Any]]:
        """Check if view file complies with service layer architecture"""
        violations = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Skip if not a view file
            if 'views.py' not in file_path:
                return violations
            
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                line_stripped = line.strip()
                
                # Check for forbidden ORM patterns in views
                for pattern in cls.FORBIDDEN_VIEW_PATTERNS:
                    if pattern in line_stripped and not line_stripped.startswith('#'):
                        violations.append({
                            'type': 'ORM_IN_VIEW',\n                            'file': file_path,\n                            'line': line_num,\n                            'pattern': pattern,\n                            'message': f'Direct ORM usage forbidden in views. Use service layer instead.',\n                            'suggestion': 'Move ORM logic to appropriate service class'\n                        })\n            \n            return violations\n            \n        except Exception as e:\n            return [{\n                'type': 'FILE_ERROR',\n                'file': file_path,\n                'message': f'Error reading file: {e}'\n            }]\n    \n    @classmethod\n    def check_async_compliance(cls, file_path: str) -> List[Dict[str, Any]]:\n        \"\"\"Check if external API usage is async-only\"\"\"\n        violations = []\n        \n        try:\n            with open(file_path, 'r', encoding='utf-8') as f:\n                content = f.read()\n            \n            # Skip if not external API file\n            if 'external_api' not in file_path and 'services' not in file_path:\n                return violations\n            \n            lines = content.split('\\n')\n            \n            for line_num, line in enumerate(lines, 1):\n                line_stripped = line.strip()\n                \n                # Check for forbidden sync patterns\n                for pattern in cls.FORBIDDEN_SYNC_PATTERNS:\n                    if pattern in line_stripped and not line_stripped.startswith('#'):\n                        violations.append({\n                            'type': 'SYNC_API_CALL',\n                            'file': file_path,\n                            'line': line_num,\n                            'pattern': pattern,\n                            'message': f'Synchronous API call forbidden. Use async tasks only.',\n                            'suggestion': 'Replace with Celery task and cache lookup'\n                        })\n            \n            return violations\n            \n        except Exception as e:\n            return [{\n                'type': 'FILE_ERROR',\n                'file': file_path,\n                'message': f'Error reading file: {e}'\n            }]\n    \n    @classmethod\n    def check_import_compliance(cls, file_path: str) -> List[Dict[str, Any]]:\n        \"\"\"Check for forbidden bridge imports\"\"\"\n        violations = []\n        \n        try:\n            with open(file_path, 'r', encoding='utf-8') as f:\n                content = f.read()\n            \n            lines = content.split('\\n')\n            \n            for line_num, line in enumerate(lines, 1):\n                line_stripped = line.strip()\n                \n                # Check for bridge imports\n                if '_bridge' in line_stripped and 'import' in line_stripped:\n                    violations.append({\n                        'type': 'BRIDGE_IMPORT',\n                        'file': file_path,\n                        'line': line_num,\n                        'message': 'Bridge imports are forbidden after Phase 5 cleanup',\n                        'suggestion': 'Use direct imports from target apps'\n                    })\n                \n                # Check for try/except import fallbacks\n                if 'try:' in line_stripped and line_num < len(lines) - 2:\n                    next_lines = lines[line_num:line_num+3]\n                    if any('import' in l and 'except' in lines[line_num+i+1] for i, l in enumerate(next_lines[:2])):\n                        violations.append({\n                            'type': 'FALLBACK_IMPORT',\n                            'file': file_path,\n                            'line': line_num,\n                            'message': 'Fallback imports are forbidden after Phase 5 cleanup',\n                            'suggestion': 'Use direct imports only'\n                        })\n            \n            return violations\n            \n        except Exception as e:\n            return [{\n                'type': 'FILE_ERROR',\n                'file': file_path,\n                'message': f'Error reading file: {e}'\n            }]\n    \n    @classmethod\n    def scan_directory(cls, directory: str) -> Dict[str, List[Dict[str, Any]]]:\n        \"\"\"Scan entire directory for architectural violations\"\"\"\n        all_violations = {\n            'view_violations': [],\n            'async_violations': [],\n            'import_violations': []\n        }\n        \n        for root, dirs, files in os.walk(directory):\n            # Skip certain directories\n            dirs[:] = [d for d in dirs if d not in ['__pycache__', '.git', 'migrations', 'node_modules']]\n            \n            for file in files:\n                if file.endswith('.py'):\n                    file_path = os.path.join(root, file)\n                    \n                    # Check view compliance\n                    view_violations = cls.check_view_compliance(file_path)\n                    all_violations['view_violations'].extend(view_violations)\n                    \n                    # Check async compliance\n                    async_violations = cls.check_async_compliance(file_path)\n                    all_violations['async_violations'].extend(async_violations)\n                    \n                    # Check import compliance\n                    import_violations = cls.check_import_compliance(file_path)\n                    all_violations['import_violations'].extend(import_violations)\n        \n        return all_violations\n    \n    @classmethod\n    def generate_compliance_report(cls, directory: str) -> str:\n        \"\"\"Generate comprehensive compliance report\"\"\"\n        violations = cls.scan_directory(directory)\n        \n        report = []\n        report.append(\"MVTPS Architectural Compliance Report\")\n        report.append(\"=\" * 50)\n        report.append(\"\")\n        \n        total_violations = sum(len(v) for v in violations.values())\n        \n        if total_violations == 0:\n            report.append(\"✅ ALL ARCHITECTURAL RULES COMPLIANT\")\n            report.append(\"\")\n            report.append(\"✓ No ORM usage in views\")\n            report.append(\"✓ No synchronous API calls\")\n            report.append(\"✓ No bridge imports\")\n            report.append(\"✓ No fallback patterns\")\n        else:\n            report.append(f\"❌ {total_violations} ARCHITECTURAL VIOLATIONS FOUND\")\n            report.append(\"\")\n            \n            # View violations\n            if violations['view_violations']:\n                report.append(f\"ORM in Views Violations ({len(violations['view_violations'])}):\"))\n                for v in violations['view_violations']:\n                    report.append(f\"  - {v['file']}:{v['line']} - {v['pattern']}\")\n                    report.append(f\"    {v['message']}\")\n                report.append(\"\")\n            \n            # Async violations\n            if violations['async_violations']:\n                report.append(f\"Sync API Call Violations ({len(violations['async_violations'])}):\"))\n                for v in violations['async_violations']:\n                    report.append(f\"  - {v['file']}:{v['line']} - {v['pattern']}\")\n                    report.append(f\"    {v['message']}\")\n                report.append(\"\")\n            \n            # Import violations\n            if violations['import_violations']:\n                report.append(f\"Import Violations ({len(violations['import_violations'])}):\"))\n                for v in violations['import_violations']:\n                    report.append(f\"  - {v['file']}:{v['line']}\")\n                    report.append(f\"    {v['message']}\")\n                report.append(\"\")\n        \n        report.append(\"Architectural Rules:\")\n        report.append(\"1. Views must only call service methods (no direct ORM)\")\n        report.append(\"2. External APIs must be async-only (no sync fallbacks)\")\n        report.append(\"3. No bridge imports allowed (direct imports only)\")\n        report.append(\"4. No try/except import fallbacks\")\n        \n        return \"\\n\".join(report)\n\ndef main():\n    \"\"\"CLI interface for architectural compliance checking\"\"\"\n    if len(sys.argv) > 1:\n        directory = sys.argv[1]\n    else:\n        directory = os.getcwd()\n    \n    report = ArchitecturalGuardrails.generate_compliance_report(directory)\n    print(report)\n\nif __name__ == \"__main__\":\n    main()
from pathlib import Path
p=Path('pbb-lab/server/admin-handler.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("import { installAdminMenu, adminMenuStyles } from './admin-menu.mjs';", "import { installAdminMenu, adminMenuStyles } from './admin-menu.mjs';\nimport { installAdminMotion, adminMotionStyles } from './admin-motion.mjs';")
s=s.replace('</style></head><body><main>${content}</main></body></html>', '${adminMotionStyles}</style></head><body><main>${content}</main><script>(${installAdminMotion.toString()})();</script></body></html>')
s=s.replace('(${installAdminMenu.toString()})();</script>', '(${installAdminMenu.toString()})();(${installAdminMotion.toString()})();</script>')
s=s.replace('${css}${adminMenuStyles}${employeeStyles}', '${css}${adminMenuStyles}${adminMotionStyles}${employeeStyles}')
p.write_text(s,encoding='utf-8')

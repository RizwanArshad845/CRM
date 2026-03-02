/**
 * Shared Tailwind class constants for all page components.
 * Import as: import { cls } from '../../styles/classes'
 * Usage:    className={cls.row}
 */
export const cls = {
    // ── Layout ────────────────────────────────────────────────────
    /** flex items-center justify-between */
    row: 'flex items-center justify-between',
    /** flex items-center gap-2 */
    inline: 'flex items-center gap-2',
    /** flex gap-2 */
    actions: 'flex gap-2',
    /** flex gap-1 (tight icon button row) */
    iconRow: 'flex gap-1',

    // ── Container ─────────────────────────────────────────────────
    /** p-4 border rounded-lg */
    item: 'p-4 border rounded-lg',
    /** p-4 border rounded-lg hover:bg-muted/50 transition-colors */
    itemHover: 'p-4 border rounded-lg hover:bg-muted/50 transition-colors',
    /** p-3 border rounded-lg */
    itemSm: 'p-3 border rounded-lg',
    /** p-3 bg-muted rounded-lg */
    muted: 'p-3 bg-muted rounded-lg',
    /** p-4 bg-muted rounded-lg */
    mutedLg: 'p-4 bg-muted rounded-lg',

    // ── Spacing ───────────────────────────────────────────────────
    /** space-y-3 */
    list: 'space-y-3',
    /** space-y-4 */
    section: 'space-y-4',
    /** space-y-6 */
    page: 'space-y-6',

    // ── Grid ──────────────────────────────────────────────────────
    /** grid grid-cols-2 gap-4 */
    grid2: 'grid grid-cols-2 gap-4',
    /** grid grid-cols-3 gap-4 */
    grid3: 'grid grid-cols-3 gap-4',
    /** grid grid-cols-1 md:grid-cols-2 gap-4 */
    gridResponsive2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    /** grid grid-cols-2 md:grid-cols-4 gap-4 */
    gridResponsive4: 'grid grid-cols-2 md:grid-cols-4 gap-4',

    // ── Typography ────────────────────────────────────────────────
    /** text-sm text-muted-foreground */
    hint: 'text-sm text-muted-foreground',
    /** text-xs text-muted-foreground */
    hintXs: 'text-xs text-muted-foreground',
    /** text-sm font-medium */
    label: 'text-sm font-medium',
    /** font-semibold */
    heading: 'font-semibold',
    /** text-2xl font-bold */
    metric: 'text-2xl font-bold',
    /** text-3xl font-bold */
    metricLg: 'text-3xl font-bold',
    /** text-xl font-bold */
    metricSm: 'text-xl font-bold',
    /** text-sm font-mono */
    mono: 'text-sm font-mono',

    // ── Avatar / Initials ─────────────────────────────────────────
    /** h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center */
    avatar: 'h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center',
    /** font-medium text-primary */
    avatarText: 'font-medium text-primary',

    // ── Table ─────────────────────────────────────────────────────
    /** border-b hover:bg-muted/50 */
    tableRow: 'border-b hover:bg-muted/50',
    /** text-left p-3 font-semibold */
    tableHead: 'text-left p-3 font-semibold',
    /** p-3 */
    tableCell: 'p-3',

    // ── Form ──────────────────────────────────────────────────────
    /** space-y-2 */
    field: 'space-y-2',
    /** w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary */
    input: 'w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary',
} as const;

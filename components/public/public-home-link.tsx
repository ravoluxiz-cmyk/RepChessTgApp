import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import styles from "./public-page.module.css"

export function PublicHomeLink({ href = "/" }: { href?: string }) {
  return <Link href={href} className={styles.homeLink}><ArrowLeft size={18} aria-hidden="true" />На главную</Link>
}

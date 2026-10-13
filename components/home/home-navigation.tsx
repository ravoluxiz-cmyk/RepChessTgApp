"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { TELEGRAM_URL } from "@/lib/seo"
import styles from "./home-refresh.module.css"

export function HomeNavigation() {
  const [open, setOpen] = useState(false)
  function close() { setOpen(false) }
  return (
    <header className={styles.header} onKeyDown={(event) => { if (event.key === "Escape") close() }}>
      <Link href="/" className={styles.brand} aria-label="Rep Chess KRD — главная"><Image src="/home/rep-chess-logo.png" width={455} height={180} alt="Rep Chess" /><span>КРАСНОДАР<br />CHESS IS REP</span></Link>
      <nav className={styles.desktopNavigation} aria-label="Основная навигация"><a href="#community">Комьюнити</a><a href="#events">Турниры</a><Link href="/corporate">Для компаний</Link><a href="#app" className={styles.navApp}>Приложение <ArrowUpRight size={16} aria-hidden="true" /></a></nav>
      <button type="button" className={styles.menuToggle} aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} aria-controls="home-mobile-menu" onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      {open && <nav id="home-mobile-menu" className={styles.mobileNavigation} aria-label="Мобильная навигация"><a href="#app" onClick={close}>Скачать приложение <ArrowUpRight size={18} aria-hidden="true" /></a><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={close}>Telegram <ArrowUpRight size={18} aria-hidden="true" /></a><a href="#community" onClick={close}>Комьюнити</a><a href="#events" onClick={close}>Турниры</a><Link href="/beginners" onClick={close}>Новичкам</Link><Link href="/corporate" onClick={close}>Для компаний</Link></nav>}
    </header>
  )
}

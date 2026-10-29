import { useEffect, useRef } from 'react'

const WORK = [
  {
    year: '2025',
    title: '个人工具集',
    desc: '把日常高频操作收成一组小而快的网页工具，注重键盘流与可读性。',
    meta: 'React · Vite',
  },
  {
    year: '2024',
    title: '接口观测面板',
    desc: '为小团队接口链路做轻量监控与告警摘要，减少翻日志的时间。',
    meta: 'TypeScript · Node',
  },
  {
    year: '2023',
    title: '内容站点改造',
    desc: '重做信息架构与排版节奏，让长文阅读更顺、加载更轻。',
    meta: '前端工程',
  },
] as const

function useReveal() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const nodes = root.querySelectorAll<HTMLElement>('.reveal')
    if (!nodes.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return rootRef
}

export default function App() {
  const rootRef = useReveal()

  return (
    <div className="site" ref={rootRef}>
      <header className="hero" id="top">
        <nav className="nav" aria-label="主导航">
          <a className="nav__mark" href="#top">
            Andy Lau
          </a>
          <ul className="nav__links">
            <li>
              <a href="#about">关于</a>
            </li>
            <li>
              <a href="#work">作品</a>
            </li>
            <li>
              <a href="#contact">联系</a>
            </li>
          </ul>
        </nav>

        <div className="hero__media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80"
            alt=""
            width={2400}
            height={1600}
            fetchPriority="high"
          />
        </div>
        <div className="hero__veil" aria-hidden="true" />

        <div className="hero__content">
          <p className="hero__brand">Andy Lau</p>
          <h1 className="hero__headline">用代码把想法做成产品</h1>
          <p className="hero__lede">
            独立开发者，关注体验细节与可维护的工程实现。
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#work">
              看看作品
            </a>
            <a className="btn btn--ghost" href="#contact">
              联系我
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="section section--about" id="about">
          <div className="about__visual reveal">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
              alt="工作台上的笔记本与笔记"
              width={1400}
              height={933}
              loading="lazy"
            />
          </div>
          <div className="about__copy reveal">
            <p className="section__label">About</p>
            <h2 className="section__title">把复杂问题拆成清晰路径</h2>
            <p className="section__text">
              我喜欢从真实使用场景出发：先想清楚谁在用、哪里卡住，再落成界面与代码。
              日常在前端、小型全栈与工具型产品之间切换，追求干净的交互和经得起改的结构。
            </p>
          </div>
        </section>

        <section className="section" id="work">
          <div className="reveal">
            <p className="section__label">Selected work</p>
            <h2 className="section__title">最近在做的事</h2>
            <p className="section__text">
              精选几段近期实践。内容可按你的真实项目随时替换。
            </p>
          </div>

          <ul className="work-list">
            {WORK.map((item, index) => (
              <li
                className="work-item reveal"
                key={item.title}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <span className="work-item__year">{item.year}</span>
                <div>
                  <h3 className="work-item__title">{item.title}</h3>
                  <p className="work-item__desc">{item.desc}</p>
                </div>
                <span className="work-item__meta">{item.meta}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section section--contact" id="contact">
          <div className="reveal">
            <p className="section__label">Contact</p>
            <h2 className="section__title">有想法？一起聊聊</h2>
          </div>
          <div className="contact-panel reveal">
            <p>
              合作、咨询或随便打个招呼都可以。把你的邮件或 GitHub 换成自己的联系方式即可上线。
            </p>
            <div className="contact-panel__actions">
              <a className="btn btn--ink" href="mailto:hello@andylau.dev">
                发邮件
              </a>
              <a
                className="btn btn--outline"
                href="https://github.com/andysniper911-cpu"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>
          <strong>Andy Lau</strong> · Personal site
        </span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

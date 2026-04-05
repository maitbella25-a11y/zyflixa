import { useEffect, useRef } from 'react'

// ── Banner 300x250 ────────────────────────────────────────────────────────────
export const AdBanner300x250: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const injected = useRef(false)

  useEffect(() => {
    if (injected.current || !ref.current) return
    injected.current = true

    // atOptions script
    const optScript = document.createElement('script')
    optScript.text = `
      atOptions = {
        'key' : '6774ec2c4f51725890d99de162fdcd6b',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `
    ref.current.appendChild(optScript)

    // invoke script
    const invokeScript = document.createElement('script')
    invokeScript.src = 'https://www.highperformanceformat.com/6774ec2c4f51725890d99de162fdcd6b/invoke.js'
    invokeScript.async = true
    ref.current.appendChild(invokeScript)
  }, [])

  return (
    <div className="flex justify-center my-4">
      <div ref={ref} style={{ width: 300, height: 250, overflow: 'hidden' }} />
    </div>
  )
}

// ── Native Banner ─────────────────────────────────────────────────────────────
export const AdNativeBanner: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const injected = useRef(false)

  useEffect(() => {
    if (injected.current || !ref.current) return
    injected.current = true

    const script = document.createElement('script')
    script.src = 'https://pl29071523.profitablecpmratenetwork.com/8219bf70abd45e9b78500fac0a6fb0d6/invoke.js'
    script.async = true
    script.setAttribute('data-cfasync', 'false')

    const container = document.createElement('div')
    container.id = 'container-8219bf70abd45e9b78500fac0a6fb0d6'

    ref.current.appendChild(container)
    ref.current.appendChild(script)
  }, [])

  return (
    <div className="w-full my-4 px-4 sm:px-8 lg:px-16">
      <div ref={ref} />
    </div>
  )
}

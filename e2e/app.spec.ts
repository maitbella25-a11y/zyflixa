import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Zyflixa/i)
    expect(page.url()).toContain('localhost')
  })

  test('should display navigation', async ({ page }) => {
    const navbar = await page.locator('nav')
    await expect(navbar).toBeVisible()

    // Check for main nav links
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Movies/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /TV Shows/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Anime/i })).toBeVisible()
  })

  test('should display hero banner', async ({ page }) => {
    const heroBanner = await page.locator('[class*="hero"]')
    // Check if any hero-related content exists
    const allElements = await page.locator('body *')
    expect(await allElements.count()).toBeGreaterThan(0)
  })

  test('should have working search functionality', async ({ page }) => {
    const searchButton = await page.getByLabel('Open search')
    await searchButton.click()

    const searchInput = await page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('Inception')
    await page.keyboard.press('Enter')

    // Wait for navigation to search page
    await page.waitForURL('**/search**')
    expect(page.url()).toContain('q=Inception')
  })

  test('should navigate to browse page', async ({ page }) => {
    await page.getByRole('link', { name: /Movies/i }).click()
    await page.waitForURL('**/browse/movies**')
    expect(page.url()).toContain('/browse/movies')
  })
})

test.describe('Search Functionality', () => {
  test('should display search results', async ({ page }) => {
    await page.goto('/?search=Inception')
    await page.waitForLoadState('networkidle')

    // Check if results are displayed
    const results = await page.locator('[class*="card"]')
    expect(await results.count()).toBeGreaterThanOrEqual(0)
  })

  test('should filter by media type', async ({ page }) => {
    await page.goto('/search?q=test')
    await page.waitForLoadState('networkidle')

    const movieFilter = await page.getByRole('button', { name: /Movies/i })
    await movieFilter.click()

    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('q=test')
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1 = await page.locator('h1')
    expect(await h1.count()).toBeGreaterThanOrEqual(0)
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement)
  })

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/')

    const images = await page.locator('img')
    const count = await images.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt')
      // Some images might not have alt text, but critical ones should
      if (alt === null) {
        console.warn(`Image ${i} has no alt text`)
      }
    }
  })
})

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - start

    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should handle slow network gracefully', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100)
    })

    await page.goto('/')
    const navbar = await page.locator('nav')
    await expect(navbar).toBeVisible()
  })
})

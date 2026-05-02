import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'

export function NotFoundPage() {
  return (
    <section className="lift-page space-y-6">
      <PageHeader
        title="Page not found"
        description="That URL does not match anything in Liftlog. Double-check the address or head back home."
      />
      <Link className="lift-btn-primary inline-flex w-fit" to="/">
        Back to dashboard
      </Link>
    </section>
  )
}

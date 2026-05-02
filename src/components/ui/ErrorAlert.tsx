type ErrorAlertProps = {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      className="lift-error rounded-xl px-4 py-3 text-sm break-words whitespace-pre-wrap"
      role="alert"
    >
      {message}
    </div>
  )
}

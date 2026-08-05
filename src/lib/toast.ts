type ToastItem = { id: number; text: string }

let listener: ((t: ToastItem) => void) | null = null

export function onToast(fn: (t: ToastItem) => void) {
  listener = fn
  return () => {
    listener = null
  }
}

let counter = 0

export function toast(text: string) {
  counter += 1
  listener?.({ id: counter, text })
}
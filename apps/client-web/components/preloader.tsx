import Image from "next/image"

export default function Preloader() {
  return (
    <div className="flex items-center justify-center z-999 fixed inset-0 bg-background">
      <div>
        <Image
          src="/assets/loading.svg"
          alt="Loading"
          height={100}
          className="size-50"
          width={100}
        />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

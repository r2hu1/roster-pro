"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query"

import { cn } from "@workspace/ui/lib/utils"

interface BaseProps {
  children: React.ReactNode
}

interface RootResponsiveProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ResponsiveProps extends BaseProps {
  className?: string
  asChild?: boolean
}

interface ResponsiveContentProps extends ResponsiveProps {
  onPointerDownOutside?: (event: unknown) => void
  onInteractOutside?: (event: unknown) => void
}

const ResponsiveContext = React.createContext<{
  isDesktop: boolean
} | null>(null)

const useResponsiveContext = () => {
  const context = React.useContext(ResponsiveContext)
  if (!context) {
    throw new Error("Responsive components must be used inside ResponsiveModal")
  }
  return context
}

const ResponsiveModal = ({ children, ...props }: RootResponsiveProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const RootComponent = isDesktop ? Dialog : Drawer

  return (
    <ResponsiveContext.Provider value={{ isDesktop }}>
      <RootComponent {...props}>{children}</RootComponent>
    </ResponsiveContext.Provider>
  )
}

const ResponsiveModalTrigger = ({
  className,
  children,
  asChild = true,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext()
  const TriggerComponent = isDesktop ? DialogTrigger : DrawerTrigger

  return (
    <TriggerComponent asChild={asChild} className={className} {...props}>
      {children}
    </TriggerComponent>
  )
}

const ResponsiveModalClose = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext()
  const CloseComponent = isDesktop ? DialogClose : DrawerClose

  return (
    <CloseComponent className={className} {...props}>
      {children}
    </CloseComponent>
  )
}

const ResponsiveModalContent = ({
  className,
  children,
  ...props
}: ResponsiveContentProps) => {
  const { isDesktop } = useResponsiveContext()
  const ContentComponent = isDesktop ? DialogContent : DrawerContent

  return (
    <ContentComponent className={className} {...props}>
      {children}
    </ContentComponent>
  )
}

const ResponsiveModalDescription = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext()
  const DescriptionComponent = isDesktop ? DialogDescription : DrawerDescription

  return (
    <DescriptionComponent className={className} {...props}>
      {children}
    </DescriptionComponent>
  )
}

const ResponsiveModalHeader = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext()
  const HeaderComponent = isDesktop ? DialogHeader : DrawerHeader

  return (
    <HeaderComponent className={className} {...props}>
      {children}
    </HeaderComponent>
  )
}

const ResponsiveModalTitle = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext()
  const TitleComponent = isDesktop ? DialogTitle : DrawerTitle

  return (
    <TitleComponent className={className} {...props}>
      {children}
    </TitleComponent>
  )
}

const ResponsiveModalBody = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  return (
    <div className={cn("px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  )
}

const ResponsiveModalFooter = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext()
  const FooterComponent = isDesktop ? DialogFooter : DrawerFooter

  return (
    <FooterComponent className={className} {...props}>
      {children}
    </FooterComponent>
  )
}

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalBody,
  ResponsiveModalFooter,
}

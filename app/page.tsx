import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FlaskConical,
  Users,
  FileCheck,
  Calendar,
  Settings,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Package,
  Factory,
  Shield,
  Briefcase,
  Truck,
  Lock,
  Target,
} from "lucide-react";

export default function Home() {
  const gerencias = [
    {
      title: "Calidad",
      description: "Gestión de eventos microbiológicos y control de calidad",
      href: "/quality",
      icon: FlaskConical,
      color: "bg-[#091EB7]",
      hoverColor: "hover:bg-[#050F5C]",
      enabled: true,
    },
    {
      title: "Dirección",
      description: "Planeación y gestión de recursos (Agua, CO2, Energía, Otros)",
      href: "/direction",
      icon: Target,
      color: "bg-[#0ADDD7]",
      hoverColor: "hover:bg-[#091EB7]",
      enabled: true,
    },
    {
      title: "Mantenimiento",
      description: "Gestión de equipos y mantenimiento preventivo",
      href: "#",
      icon: Wrench,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      enabled: false,
    },
    {
      title: "Envase",
      description: "Control de procesos de envasado y embotellado",
      href: "#",
      icon: Package,
      color: "bg-[#0ADDD7]",
      hoverColor: "hover:bg-[#091EB7]",
      enabled: false,
    },
    {
      title: "Elaboración",
      description: "Seguimiento de procesos de producción de cerveza",
      href: "#",
      icon: Factory,
      color: "bg-[#FE941E]",
      hoverColor: "hover:bg-[#EBA600]",
      enabled: false,
    },
    {
      title: "Seguridad",
      description: "Protocolos de seguridad y salud ocupacional",
      href: "#",
      icon: Shield,
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600",
      enabled: false,
    },
    {
      title: "Gestión",
      description: "Administración y gestión empresarial",
      href: "#",
      icon: Briefcase,
      color: "bg-[#091EB7]",
      hoverColor: "hover:bg-[#050F5C]",
      enabled: false,
    },
    {
      title: "Logística",
      description: "Planificación y control de distribución",
      href: "#",
      icon: Truck,
      color: "bg-teal-500",
      hoverColor: "hover:bg-teal-600",
      enabled: false,
    },
  ];

  const features = [
    {
      title: "Gestión Integral",
      description: "Plataforma unificada para todas las áreas de la cervecería",
      imagePlaceholder: "Imagen: Instalaciones de Cervecería del Atlántico",
    },
    {
      title: "Control en Tiempo Real",
      description: "Monitoreo continuo de procesos y reportes instantáneos",
      imagePlaceholder: "Imagen: Dashboard con métricas de producción",
    },
    {
      title: "Trazabilidad Completa",
      description: "Registro detallado de todos los procesos y eventos",
      imagePlaceholder: "Imagen: Sistema de trazabilidad de lotes",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
                  Cervecería del
                  <span className="block text-[#091EB7] dark:text-[#0ADDD7]">
                    Atlántico
                  </span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
                  Plataforma integral para la gestión de todas las áreas de la
                  cervecería. Control de calidad, producción, mantenimiento y
                  más, todo en un solo lugar.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/quality/micro/operator">
                  <Button size="lg" className="group">
                    Acceder a Calidad
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/quality/micro/settings">
                  <Button size="lg" variant="outline">
                    Configuración
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#0ADDD7]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Gestión Integral
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#0ADDD7]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Tiempo Real
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#0ADDD7]" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Trazabilidad
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                      <Factory className="h-24 w-24 mx-auto text-[#091EB7] dark:text-[#0ADDD7] opacity-50" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    [Imagen Hero: Instalaciones de Cervecería del Atlántico]
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recomendado: 1200x900px
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Características Principales
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Herramientas diseñadas para optimizar todos los procesos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-xl"
              >
                {/* Image Placeholder */}
                <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                  <div className="flex h-full items-center justify-center p-6">
                    <div className="text-center space-y-2">
                      <div className="mx-auto h-16 w-16 rounded-full bg-[#F4F3FF] dark:bg-[#050F5C]/30 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-[#091EB7] dark:text-[#0ADDD7]" />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {feature.imagePlaceholder}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recomendado: 800x600px
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gerencias Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Gerencias
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Selecciona el área de trabajo que necesitas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gerencias.map((gerencia, index) => {
              const Icon = gerencia.icon;
              const CardContent = (
                <div
                  className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all flex flex-col h-full ${
                    gerencia.enabled
                      ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className={`${gerencia.color} p-6 relative flex-shrink-0`}>
                    <Icon className="h-8 w-8 text-white" />
                    {!gerencia.enabled && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-5 w-5 text-white/70" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3
                      className={`text-xl font-semibold mb-2 transition-colors ${
                        gerencia.enabled
                          ? "text-gray-900 dark:text-gray-100 group-hover:text-[#091EB7] dark:group-hover:text-[#0ADDD7]"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {gerencia.title}
                    </h3>
                    <p
                      className={`text-sm mb-4 flex-1 ${
                        gerencia.enabled
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {gerencia.description}
                    </p>
                    {gerencia.enabled ? (
                      <div className="flex items-center text-[#091EB7] dark:text-[#0ADDD7] font-medium text-sm mt-auto">
                        Acceder
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400 dark:text-gray-500 font-medium text-sm mt-auto">
                        Próximamente
                        <Lock className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              );

              return gerencia.enabled ? (
                <Link key={index} href={gerencia.href}>
                  {CardContent}
                </Link>
              ) : (
                <div key={index}>{CardContent}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Image Section */}
      <section className="py-20 sm:py-32 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#F4F3FF] to-[#0ADDD7]/20 dark:from-[#050F5C]/20 dark:to-[#091EB7]/20 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <Factory className="h-20 w-20 mx-auto text-[#091EB7] dark:text-[#0ADDD7] opacity-50" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    [Imagen: Proceso de producción de cerveza]
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recomendado: 1000x750px
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col justify-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Control Total de tus Procesos
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Nuestra plataforma te permite gestionar todas las áreas de la
                cervecería desde un solo lugar, con herramientas intuitivas y
                reportes detallados para cada gerencia.
              </p>
              <ul className="space-y-4">
                {[
                  "Seguimiento en tiempo real de procesos",
                  "Análisis automatizados y reportes",
                  "Trazabilidad completa de lotes",
                  "Gestión integral de todas las gerencias",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image
                src="/logo_azul.png"
                alt="Cervecería del Atlántico"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Cervecería del Atlántico
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sistema de Gestión Integral - Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

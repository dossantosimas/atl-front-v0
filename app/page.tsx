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
} from "lucide-react";

export default function Home() {
  const gerencias = [
    {
      title: "Calidad",
      description: "Gestión de eventos microbiológicos y control de calidad",
      href: "/quality/micro/settings",
      icon: FlaskConical,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      enabled: true,
      subItems: [
        {
          title: "Operador",
          href: "/quality/micro/operator",
          description: "Gestión de eventos y muestras",
        },
        {
          title: "Líder",
          href: "/quality/micro/leader",
          description: "Supervisión y análisis",
        },
        {
          title: "Auditoría",
          href: "/quality/micro/audit",
          description: "Revisión y validación",
        },
        {
          title: "Configuración",
          href: "/quality/micro/settings",
          description: "Ajustes y schedules",
        },
      ],
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
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      enabled: false,
    },
    {
      title: "Elaboración",
      description: "Seguimiento de procesos de producción de cerveza",
      href: "#",
      icon: Factory,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
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
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600",
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
                  <span className="block text-blue-600 dark:text-blue-400">
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
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Gestión Integral
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Tiempo Real
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
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
                  <Factory className="h-24 w-24 mx-auto text-blue-600 dark:text-blue-400 opacity-50" />
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
                      <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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
                  className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all ${
                    gerencia.enabled
                      ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className={`${gerencia.color} p-6 relative`}>
                    <Icon className="h-8 w-8 text-white" />
                    {!gerencia.enabled && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-5 w-5 text-white/70" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3
                      className={`text-xl font-semibold mb-2 transition-colors ${
                        gerencia.enabled
                          ? "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {gerencia.title}
                    </h3>
                    <p
                      className={`text-sm mb-4 ${
                        gerencia.enabled
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {gerencia.description}
                    </p>
                    {gerencia.enabled ? (
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                        Acceder
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400 dark:text-gray-500 font-medium text-sm">
                        Próximamente
                        <Lock className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              );

              if (gerencia.enabled && gerencia.subItems) {
                // Si tiene subItems, mostrar un dropdown o modal
                return (
                  <div key={index} className="relative group">
                    <Link href={gerencia.href}>{CardContent}</Link>
                    {/* Submenu hover */}
                    <div className="absolute top-full left-0 right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2">
                        {gerencia.subItems.map((item, subIndex) => (
                          <Link
                            key={subIndex}
                            href={item.href}
                            className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

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
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <Factory className="h-20 w-20 mx-auto text-indigo-600 dark:text-indigo-400 opacity-50" />
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
              <FlaskConical className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

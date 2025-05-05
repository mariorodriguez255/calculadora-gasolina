"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Car, ArrowLeftRight, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Definir los coches y sus consumos
const cars = [
  { id: "mario", name: "Mario", model: "Ford Focus", consumption: 8, available: true },
  { id: "maribel", name: "Maribel", model: "Kia Rio", consumption: 7, available: true },
  { id: "teran", name: "Teran", model: "Ford Mondeo", consumption: 7, available: true },
  { id: "canton", name: "Canton", model: "Opel Astra", consumption: 6.5, available: true },
  { id: "amanda", name: "Amanda", model: "Ford Mondeo", consumption: 7, available: false },
  { id: "nuria", name: "Nuria", model: "Peugeot 208", consumption: 7, available: false },
  { id: "judith", name: "Judith", model: "Seat Ibiza", consumption: 7, available: false },
  { id: "brian", name: "Brian", model: "Renault Clio", consumption: 7, available: false },
]

// Precio de la gasolina por litro
const GAS_PRICE = 1.45

// Esquema de validación
const formSchema = z.object({
  car: z.string().min(1, { message: "Selecciona un coche" }),
  secondCar: z.string().optional(),
  kilometers: z.coerce.number().min(1, { message: "Introduce los kilómetros" }),
  roundTrip: z.boolean().default(false),
  passengers: z.coerce.number().min(1, { message: "Introduce el número de pasajeros" }).max(10),
  useSecondCar: z.boolean().default(false),
})

export default function GasCalculator() {
  const [result, setResult] = useState<{
    totalKm: number
    totalCost: number
    costPerPerson: number
    litersUsed: number
    secondCarInfo?: {
      totalCost: number
      litersUsed: number
    }
  } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      car: "",
      secondCar: "",
      kilometers: "" as unknown as number,
      roundTrip: false,
      passengers: "" as unknown as number,
      useSecondCar: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Calcular kilómetros totales
    const totalKm = values.roundTrip ? values.kilometers * 2 : values.kilometers

    // Encontrar el coche seleccionado
    const selectedCar = cars.find((car) => car.id === values.car)

    if (!selectedCar) return

    // Calcular litros usados y coste total
    const litersUsed = (totalKm * selectedCar.consumption) / 100
    const totalCost = litersUsed * GAS_PRICE

    let secondCarInfo

    if (values.useSecondCar && values.secondCar) {
      const secondSelectedCar = cars.find((car) => car.id === values.secondCar)
      if (secondSelectedCar) {
        const secondCarLitersUsed = (totalKm * secondSelectedCar.consumption) / 100
        const secondCarTotalCost = secondCarLitersUsed * GAS_PRICE
        secondCarInfo = {
          totalCost: secondCarTotalCost,
          litersUsed: secondCarLitersUsed,
        }
      }
    }

    // Calcular coste por persona
    const totalPassengers = values.passengers
    const costPerPerson = secondCarInfo
      ? (totalCost + secondCarInfo.totalCost) / totalPassengers
      : totalCost / totalPassengers

    setResult({
      totalKm,
      totalCost,
      costPerPerson,
      litersUsed,
      secondCarInfo,
    })
  }

  function createWhatsAppMessage() {
    if (!result) return ""

    const selectedCar = cars.find((car) => car.id === form.getValues("car"))
    const secondSelectedCar =
      form.getValues("useSecondCar") && form.getValues("secondCar")
        ? cars.find((car) => car.id === form.getValues("secondCar"))
        : null

    let message = "🚗 *Cálculo de Gastos de Gasolina* 🚗\n\n"

    // Trip details
    message += `*Detalles del Viaje:*\n`
    message += `- Distancia total: ${result.totalKm} km\n`
    message += `- Personas: ${form.getValues("passengers")}\n`
    message += `- Tipo de viaje: ${form.getValues("roundTrip") ? "Ida y vuelta" : "Solo ida"}\n\n`

    // First car details
    message += `*Coche Principal:*\n`
    message += `- ${selectedCar?.name} (${selectedCar?.model})\n`
    message += `- Consumo: ${selectedCar?.consumption} L/100km\n`
    message += `- Litros usados: ${result.litersUsed.toFixed(2)} L\n`
    message += `- Coste: ${result.totalCost.toFixed(2)} €\n\n`

    // Second car details if applicable
    if (secondSelectedCar && result.secondCarInfo) {
      message += `*Segundo Coche:*\n`
      message += `- ${secondSelectedCar.name} (${secondSelectedCar.model})\n`
      message += `- Consumo: ${secondSelectedCar.consumption} L/100km\n`
      message += `- Litros usados: ${result.secondCarInfo.litersUsed.toFixed(2)} L\n`
      message += `- Coste: ${result.secondCarInfo.totalCost.toFixed(2)} €\n\n`
    }

    // Total and per person cost
    message += `*Resumen:*\n`
    message += `- Precio gasolina: ${GAS_PRICE.toFixed(2)} €/L\n`
    message += `- Coste total: ${(result.totalCost + (result.secondCarInfo?.totalCost || 0)).toFixed(2)} €\n`
    message += `- Coste por persona: ${result.costPerPerson.toFixed(2)} €\n\n`

    message += "Calculado con la app de Mario 👨‍💻"

    return encodeURIComponent(message)
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4 min-h-screen flex flex-col">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Calculadora de Gasolina</h1>
        <p className="text-muted-foreground mt-1">Calcula el gasto de gasolina para tus viajes</p>
        <p className="text-xs text-muted-foreground mt-2">Desarrollado por Mario Rodriguez</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Detalles del Viaje
          </CardTitle>
          <CardDescription>Introduce los detalles para calcular el coste</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="car"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Selecciona un coche</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-2"
                      >
                        {cars.map((car) => (
                          <div key={car.id}>
                            <RadioGroupItem
                              value={car.id}
                              id={car.id}
                              className="peer sr-only"
                              disabled={!car.available}
                            />
                            <Label
                              htmlFor={car.id}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                            >
                              <Car className="mb-1 h-4 w-4" />
                              <div className="text-center">
                                <p className="font-medium text-sm">{car.name}</p>
                                <p className="text-xs text-muted-foreground">{car.model}</p>
                                {!car.available && (
                                  <Badge variant="outline" className="mt-1 text-xs py-0">
                                    Próximamente
                                  </Badge>
                                )}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kilometers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilómetros</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? "" : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passengers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="4"
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? "" : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="roundTrip"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Ida y vuelta
                      </FormLabel>
                      <FormDescription>Marcar si el viaje incluye regreso</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useSecondCar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Segundo coche
                      </FormLabel>
                      <FormDescription>¿Necesitas un segundo coche?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("useSecondCar") && (
                <FormField
                  control={form.control}
                  name="secondCar"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Selecciona el segundo coche</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-2"
                        >
                          {cars
                            .filter((car) => car.available && car.id !== form.watch("car"))
                            .map((car) => (
                              <div key={`second-${car.id}`}>
                                <RadioGroupItem value={car.id} id={`second-${car.id}`} className="peer sr-only" />
                                <Label
                                  htmlFor={`second-${car.id}`}
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <Car className="mb-1 h-4 w-4" />
                                  <div className="text-center">
                                    <p className="font-medium text-sm">{car.name}</p>
                                    <p className="text-xs text-muted-foreground">{car.model}</p>
                                  </div>
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" /> Calcular
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="w-full mt-6">
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>Detalles del cálculo de gasolina</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Distancia total</p>
                  <p className="text-2xl font-bold">{result.totalKm} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Coste por persona</p>
                  <p className="text-2xl font-bold">{result.costPerPerson.toFixed(2)} €</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Detalles del primer coche</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Litros usados</p>
                    <p className="font-medium">{result.litersUsed.toFixed(2)} L</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Coste total</p>
                    <p className="font-medium">{result.totalCost.toFixed(2)} €</p>
                  </div>
                </div>
              </div>

              {result.secondCarInfo && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium">Detalles del segundo coche</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Litros usados</p>
                        <p className="font-medium">{result.secondCarInfo.litersUsed.toFixed(2)} L</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Coste total</p>
                        <p className="font-medium">{result.secondCarInfo.totalCost.toFixed(2)} €</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`https://wa.me/?text=${createWhatsAppMessage()}`, "_blank")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
                </svg>
                Compartir por WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

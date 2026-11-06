import type en from "./en"

const it: typeof en = {
  apps: {
    promotions: {
      coupons: {
        empty_state: {
          title: "Nessun coupon",
          description:
            "Aggiungi un coupon che i clienti potranno usare al checkout per applicare questa promozione.",
        },
        expiry: "Scadenza",
        status: {
          active: "Attivo",
          expired: "Scaduto",
          never_expires: "Senza scadenza",
        },
      },
    },
  },
}

export default it

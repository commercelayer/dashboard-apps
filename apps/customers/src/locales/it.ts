import type en from "./en"

const it: typeof en = {
  apps: {
    customers: {
      attributes: {
        status: "Stato",
      },
      details: {
        registered: "Registrato",
        guest: "Ospite",
        newsletter: "Newsletter",
        subscribed: "Iscritto",
        type: "Tipo",
        wallet: "Portafoglio",
        groups: "Gruppi",
      },
      anonymize: {
        title: "Il cliente non può essere eliminato",
        description:
          "I suoi dati personali saranno sostituiti ovunque, compresi gli ordini. Puoi annullare la richiesta finché non viene avviata.",
        request_button: "Richiedi anonimizzazione",
      },
      anonymization_info: {
        alert_requested:
          "Anonimizzazione del cliente richiesta da {{requestedby}} il {{requestedat}}. È possibile annullare questa richiesta finché non è processata.",
        alert_in_progress:
          "Anonimizzazione del cliente in corso. Richiesta da {{requestedby}} il {{requestedat}}.",
        alert_completed:
          "Anonimizzazione del cliente completata il {{completedat}}. Richiesta da {{requestedby}} il {{requestedat}}.",
        cancel_button: "Annulla richiesta",
      },
      form: {
        customer_group_label: "Gruppo",
        customer_group_hint: "Il gruppo di appartenenza del cliente",
        email_hint: "L'indirizzo email del cliente",
      },
    },
  },
}

export default it

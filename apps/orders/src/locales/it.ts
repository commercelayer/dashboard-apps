import type en from "./en"

const it: typeof en = {
  apps: {
    orders: {
      attributes: {
        status: "Stato",
        payment_status: "Stato pagamento",
        fulfillment_status: "Stato spedizione",
      },
      tasks: {
        cart: "Carrello",
        archived: "Archiviati",
        request_return: "Richiedi reso",
      },
      details: {
        summary: "Riepilogo",
        to_be_calculated: "Da calcolare",
        shipping: "Spedizione",
        subtotal: "Totale parziale",
        total: "Totale",
        payment_method: "Metodo di pagamento",
        taxes: "Tasse",
        included: "incluse",
        discount: "Sconto",
        use_for_shipping: "Usa per la spedizione",
        use_for_billing: "Usa per la fatturazione",
        new_total_line1:
          "Il nuovo totale è {{new_total}}, {{difference}} in più rispetto al totale originale.",
        new_total_line2: "Modifica il totale per renderlo uguale o inferiore.",
        waiting_for_successful_capture: "In attesa di catturare il pagamento",
      },
      form: {
        language: "Lingua",
        language_hint: "La lingua usata per il checkout",
        error_create_order:
          "Non è possibile creare l'ordine senza un prodotto valido. Selezionane uno.",
        email: "Indirizzo Email",
        email_placeholder: "Cerca o aggiungi un indirizzo email",
        email_hint: "L'indirizzo email del cliente per questo ordine.",
        coupon_code: "Codice coupon",
        select_adjustment_amount:
          "Seleziona un tipo di importo positivo per aumentare il totale dell'ordine.",
        manual_adjustment_name: "Modifica manuale",
      },
      actions: {
        add_item: "Aggiungi prodotto",
        approve: "Approva",
        archive: "Archivia",
        cancel_transactions: "Annulla pagamento",
        cancel: "Annulla ordine",
        capture_payment: "Cattura pagamento",
        capture: "Cattura",
        place: "Piazza ordine",
        refund: "Rimborsa",
        unarchive: "Ripristina",
        continue_editing: "Continua modifiche",
        finish_editing: "Finalizza",
        adjust_total: "Modifica il totale",
      },
    },
    returns: {
      details: {
        origin: "Magazzino origine",
        destination: "Magazzino destinazione",
        to_destination: "Verso",
      },
    },
  },
}

export default it

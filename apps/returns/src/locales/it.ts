import type en from "./en"

const it: typeof en = {
  apps: {
    returns: {
      attributes: {
        status: "Stato del reso",
      },
      details: {
        origin: "Magazzino origine",
        destination: "Magazzino destinazione",
        return_locations: "Magazzini di reso",
        delete_error: "Errore durante l'eliminazione del reso",
        timeline_requested_return:
          "{{email}} ha richiesto un reso di {{count}} prodotto",
        timeline_requested_return_other:
          "{{email}} ha richiesto un reso di {{count}} prodotti",
        timeline_shipped: "Il reso è stato <strong>spedito</strong>",
        timeline_received: "Il reso è stato <strong>ricevuto</strong>",
        timeline_cancelled: "Il reso è stato <strong>cancellato</strong>",
        timeline_archived: "Il reso è stato <strong>archiviato</strong>",
        timeline_approved: "Il reso è stato <strong>approvato</strong>",
        timeline_item_code_restocked:
          "Il prodotto {{code}} è stato <strong>riassortito</strong>",
        timeline_payment_of_amount_was_action:
          "Il pagamento di {{amount}} è stato <strong>{{action}}</strong>",
        timeline_action_of_amount_failed:
          "Il tentativo di {{action}} di {{amount}} è <strong>fallito</strong>",
      },
      form: {
        items: "Prodotti",
        no_items: "Nessun prodotto",
      },
      actions: {
        approve: "Approva",
        reject: "Rifiuta",
        cancel: "Annulla reso",
        ship: "Segna come spedito",
        receive: "Ricevuto",
        restock: "Restock",
        archive: "Archivia",
        unarchive: "Ripristina",
        refund: "Emetti un rimborso",
      },
    },
  },
}

export default it

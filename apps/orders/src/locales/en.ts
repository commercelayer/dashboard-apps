const en = {
  apps: {
    orders: {
      attributes: {
        status: "Status",
        payment_status: "Payment status",
        fulfillment_status: "Fulfillment status",
      },
      tasks: {
        cart: "Cart",
        archived: "Archived",
        request_return: "Request return",
      },
      details: {
        summary: "Summary",
        to_be_calculated: "To be calculated",
        shipping: "Shipping",
        subtotal: "Subtotal",
        total: "Total",
        payment_method: "Payment method",
        taxes: "Taxes",
        included: "included",
        discount: "Discount",
        use_for_shipping: "Use for shipping",
        use_for_billing: "Use for billing",
        new_total_line1:
          "The new total is {{new_total}}, {{difference}} more than the original total.",
        new_total_line2: "Adjust the total to make it equal or less.",
        waiting_for_successful_capture: "Waiting for successful capture",
      },
      form: {
        language: "Language",
        language_hint: "The language used for checkout",
        error_create_order:
          "Cannot create the order without a valid item. Please select one.",
        email: "Email",
        email_placeholder: "Search or add email",
        email_hint: "The customer's email for this order.",
        coupon_code: "Coupon code",
        select_adjustment_amount:
          "Select a positive amount type to increase the order total.",
        manual_adjustment_name: "Manual adjustment",
      },
      actions: {
        add_item: "Add item",
        approve: "Approve",
        archive: "Archive",
        cancel_transactions: "Cancel payment",
        cancel: "Cancel order",
        capture_payment: "Capture payment",
        capture: "Capture",
        place: "Place order",
        refund: "Refund",
        unarchive: "Unarchive",
        continue_editing: "Continue editing",
        finish_editing: "Finish",
        adjust_total: "Adjust total",
      },
    },
    returns: {
      details: {
        origin: "Origin",
        destination: "Destination",
        to_destination: "To",
      },
    },
  },
}

export default en

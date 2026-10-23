const en = {
  apps: {
    shipments: {
      attributes: {
        status: "Status",
      },
      details: {
        label_already_purchased: "Shipping label already purchased",
        get_rates_error: "Unable to get rates",
        purchase_label_error:
          "Could not purchase shipping label, please contact your carrier.",
        select_rate: "Select a shipping rate",
        getting_rates: "Getting rates...",
        purchasing: "Purchasing...",
        not_in_packing: "This shipment is not in packing status",
        picking_list: "Picking list",
        ship_from: "Ship from",
        ship_to: "Ship to",
        origin: "Origin",
        weight: "Weight",
      },
      tasks: {
        packing: "Packing",
      },
      actions: {
        put_on_hold: "Put on hold",
        start_picking: "Start picking",
        start_packing: "Start packing",
        continue_packing: "Continue",
        set_back_to_picking: "Back to picking",
        set_ready_to_ship: "Ready to ship",
        set_shipped: "Mark as shipped",
        set_delivered: "Mark as delivered",
        purchase_label: "Purchase label",
        purchase_labels: "Purchase labels",
      },
      form: {
        unit_of_weight: "Unit of weight",
        required_package: "Please select a package",
        invalid_weight: "Please enter a weight",
        invalid_unit_of_weight: "Please select a unit of weight",
        incoterms_rules: "Incoterms rules",
        select_option: "Select an option",
        delivery_confirmation: "Delivery confirmations",
        require_custom_forms: "Require custom forms",
        customs_info_type: "The type of item you are sending",
        content_explanation_hint: "Insert a brief description",
        customs_info_failed_delivery_label:
          "In case the shipment cannot be delivered",
        customs_info_restriction_type_label: "Requires any special treatment",
        customs_info_customs_signer_label: "Customs signer",
        customs_info_confirm_checkbox_label:
          "I confirm the provided information is accurate",
        required_custom_form_value:
          "Required when specifying a customs form value",
        required_if_other_is_selected: 'Please specify if "other" is selected',
        required_restriction_comments:
          "Please add a comment or select 'none' as restriction type",
        customs_info_customs_signer_signature: "Signature",
        customs_info_customs_signer_no_signature: "No signature",
        customs_info_type_merchandise: "Merchandise",
        customs_info_type_gift: "Gift",
        customs_info_type_documents: "Documents",
        customs_info_type_returned_goods: "Returned goods",
        customs_info_type_sample: "Sample",
        customs_info_type_other: "Other",
        customs_info_failed_delivery_return: "Return",
        customs_info_failed_delivery_abandon: "Abandon",
        customs_info_restriction_type_none: "None",
        customs_info_restriction_type_other: "Other",
        customs_info_restriction_type_quarantine: "Quarantine",
        customs_info_restriction_type_sanitary_phytosanitary_inspection:
          "Sanitary or Phytosanitary inspection",
        no_packages_found: "No packages found for current stock location",
        select_package: "Select a package",
        packing_items: "items",
        pack_items: "Pack · {{items}}",
        more_options: "More options",
      },
    },
  },
}

export default en

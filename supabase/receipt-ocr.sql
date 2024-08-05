CREATE OR REPLACE FUNCTION process_inventory_items(
    p_user_id TEXT,
    p_inventory_items JSONB
) RETURNS SETOF inventory AS $$
DECLARE
    v_item RECORD;
    v_unit_id UUID;
    v_item_id UUID;
    v_inventory_entry inventory;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_inventory_items) AS x(item TEXT, quantity NUMERIC, unit TEXT)
    LOOP
        -- Start a subtransaction for each item
        BEGIN
            -- Check if unit exists, if not create it
            SELECT id INTO v_unit_id FROM units WHERE name = v_item.unit;
            IF NOT FOUND THEN
                INSERT INTO units (name, user_id) VALUES (v_item.unit, p_user_id) RETURNING id INTO v_unit_id;
            END IF;

            -- Check if item exists, if not create it
            SELECT id INTO v_item_id FROM items WHERE name = v_item.item;
            IF NOT FOUND THEN
                INSERT INTO items (name, user_id) VALUES (v_item.item, p_user_id) RETURNING id INTO v_item_id;
            END IF;

            -- Create inventory entry
            INSERT INTO inventory (user_id, item_id, unit_id, quantity)
            VALUES (p_user_id, v_item_id, v_unit_id, v_item.quantity)
            RETURNING * INTO v_inventory_entry;

            RETURN NEXT v_inventory_entry;

        EXCEPTION
            WHEN OTHERS THEN
                -- If there's an error, roll back this item's changes and continue with the next
                RAISE WARNING 'Error processing item %: %', v_item.item, SQLERRM;
        END;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

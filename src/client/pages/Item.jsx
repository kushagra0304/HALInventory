import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';

const CreateItem = (props) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [attributes, setAttributes] = useState([]);
    const [tempAttributes, setTempAttributes] = useState([]);

    const createAttribute = () => {
        const form = document.getElementById('createAttribute');

        if(!form.attributeName) {
            return;
        }
        
        setTempAttributes([...tempAttributes, {
            name: form.attributeName.value,
            required: form.required.checked
        }])

        setAttributes([...attributes,
            <Form.Group className="mb-3">
                <Form.Control disabled type="text" id={form.attributeName.value} placeholder={form.attributeName.value} value={form.attributeName.value}/>
                <Form.Check
                    id={form.attributeName.value + "required"}
                    type="checkbox"
                    label="required"
                    defaultChecked={form.required.checked}
                    disabled
                />
            </Form.Group>
        ])
    }

    const handleItemSubmit = async (event) => {
        try {
            event.preventDefault();

            const { value: name } = event.target.itemName;
            const { value: category } = event.target.categoryName;

            const res = await axios.post('/api/item', {
                name,
                category_name: category,
                attributes: tempAttributes,
            });

            props.setAlert("sucess", "Sucess")
        } catch(err) {
            props.setAlert("danger", "Failed")
        }
    }

    return (
        <>
            <Form onSubmit={handleItemSubmit}>
                <Form.Group className="mb-3" controlId="itemName">
                    <Form.Label>Enter Item name</Form.Label>
                    <Form.Control type="text" placeholder="Enter name" />
                    <Form.Text className="text-muted">
                        Item name should be unique.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="categoryName">
                    <Form.Label>Enter Category name</Form.Label>
                    <Form.Control type="text" placeholder="Enter category" />
                </Form.Group>

                <h3 className='mb-3'>Attributes</h3>

                {attributes}

                <Button onClick={handleShow} id="createAttributeBtn"variant="primary" className="mb-3">
                    Create Attribute
                </Button>

                <br/>

                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Attribute</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form id='createAttribute'>
                        <Form.Group className="mb-3" controlId="attributeName">
                            <Form.Label>Enter Attribute name</Form.Label>
                            <Form.Control type="text" placeholder="Enter attribute" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="required">
                            <Form.Check
                                type="checkbox"
                                label="Required"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={() => {
                        createAttribute();
                    }}>submit</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const AddItem = (props) => {
    const [item, setItem] = useState(null);

    const fetchItem = async (e) => {
        e.preventDefault();
        let res;
        try {
            res = await axios.get(`/api/item/search?q=${e.target.itemSearch.value}`);

            const { data } = await axios.get(`/api/item/${res.data[0].id}`);

            setItem(data);

            console.log(data)

            props.setAlert({variant: "success", text: "success"})
        } catch(err) {
            console.error(err);
            props.setAlert({variant: "danger", text: "Failed to get item"})
        }
    }

    const addItem = async (e) => {
        try {
            e.preventDefault();

            const data = {
                item_id: item.id,
                quantity: e.target.quantity.value,
                attributeValues: item.attributes.map(attr => ({
                    id: attr.id,
                    value: e.target[`${attr.id}a`].value
                }))
            }

            console.log(data);

            await axios.post('/api/item/variation', data);

            props.setAlert({variant: "success", text: "success"})
        } catch(err) {
            console.error(err);
            props.setAlert({variant: "danger", text: "Failed to get item"})
        }
    }

    return (
        <>
            <Form className='mb-3' onSubmit={fetchItem}>
                <Form.Group className="mb-3" controlId="itemSearch">
                    <Form.Label>Search Item</Form.Label>
                    <Form.Control type="text" placeholder="Search Item" />
                </Form.Group>
                <Button variant="primary" type='submit'>
                    Submit
                </Button>
            </Form>
            {
                !item ? <></> : 
                <div>
                    <h3>Enter Item values</h3>
                    <Form onSubmit={addItem}>
                        <div>
                            {
                                item.attributes.map((attr, index) => (
                                    <Form.Group key={index} className="mb-3" controlId={attr.id+"a"}>
                                        <Form.Label>{attr.name}</Form.Label>
                                        {
                                            attr.required ? 
                                            <Form.Control required type="text" placeholder={attr.name}/> :
                                            <Form.Control type="text" placeholder={attr.name} />
                                        }
                                    </Form.Group>
                                ))
                            }
                            <Form.Group className="mb-3" controlId='quantity'>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control required type="number" placeholder="Enter a number"/>
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </div>
                    </Form>
                </div>
            }
        </>
    )
}

const Item = () => {
    const [create, setCreate] = useState(true);
    const [alert, setAlert] = useState({
        variant: '',
        text: ''
    });

    return (
        <>
            <div>
                <div>
                    <Alert variant={alert.variant}>
                        <p>{alert.text}</p>
                    </Alert>
                </div>
                <div>
                    <Form>
                        <Form.Group className="mb-3" controlId="createItemRadio">
                            <Form.Check
                                type="radio"
                                label="Create Item"
                                value="createItem"
                                checked={create === 'createItem'}
                                onChange={(e) => setCreate(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                label="Add Item"
                                value="addItem"
                                checked={create === 'addItem'}
                                onChange={(e) => setCreate(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </div>
                {create === 'createItem' ? <CreateItem setAlert={setAlert}/> : <AddItem setAlert={setAlert}/>}
            </div>
        </>
    )
}

export default Item;
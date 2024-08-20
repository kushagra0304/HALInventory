import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { useState } from 'react';

const Category = () => {
    const [alert, setAlert] = useState({
        variant: '',
        text: ''
    });

    const handleNewCategorySubmit = async (e) => {
        try {
            e.preventDefault();

            const { value } = e.target.newCategory;

            const res = axios.post('/api/category', {
                name: value
            });

            setAlert({
                variant: 'success',
                text: 'Success'
            })
        } catch(err) {
            setAlert({
                variant: 'danger',
                text: 'Failed'
            })
        }
    }
    return (
        <>
            <div>
                <div>
                    <Alert variant={alert.variant}>
                        <p>{alert.text}</p>
                    </Alert>
                </div>
                <Form onSubmit={handleNewCategorySubmit}>
                    <Form.Group className="mb-3" controlId="newCategory">
                        <Form.Label>Enter new category</Form.Label>
                        <Form.Control type="text" placeholder="Enter category" />
                        <Form.Text className="text-muted">
                            Category name should be unique.
                        </Form.Text>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        </>
    )
}

export default Category;
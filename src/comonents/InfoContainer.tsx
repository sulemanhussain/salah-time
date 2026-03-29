import { useState, useEffect } from "react"
import Modal from "./Modal";

export default function InfoContainer({ place }) {
    const [content, setContent] = useState();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (place === undefined || place === null) return;
        const contentData = `<div class='container-fluid'><h2>${place.name}</h2><label>${place.vicinity}</label>
            <hr />
            <table class='table'><thead><tr><th>Salwat</th><th>Adaan</th><th>Jamat</th></tr></thead>
            <tbody>
            <tr><td>Fajr</td><td>05:10 am</td><td>05:30 am</td></tr>
            <tr><td>Zohar</td><td>12:45 pm</td><td>01:10 pm</td></tr>
            <tr><td>Asr</td><td>04:30 pm</td><td>04:50 pm</td></tr>
            <tr><td>Magrib</td><td>06:30 pm</td><td>06:30 pm</td></tr>
            <tr><td>Isha</td><td>07:50 pm</td><td>08:15 pm</td></tr>
            </tbody>
            </table>
            <hr />
            <div class='row'>
            <button type='button' name='update-timing-btn' class='btn btn-sm btn-success p-10' onclick='updateTimings()' data-bs-toggle="modal" data-bs-target="#exampleModal" style='float:left;'>Update timings</button>
            <button type='button' name='reset-btn' class='btn btn-sm btn-link p-10' onclick='report()' style='float:right;'>Report</button></div>
            <em>you can contribute by updating salwat timings if it's miss match.</em>
            </div>`
    
        setContent(contentData);
        setShowModal(true);

    }, [place]);

    if (place === undefined || place === null) return null;

    return (
        <>
            <Modal isOpen={showModal} content={content} />
        </>
    )
}
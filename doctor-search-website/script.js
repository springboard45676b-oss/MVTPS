document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const specialization = e.target.specialization.value;
    const location = e.target.location.value;

    fetch(`backend/search.php?specialization=${encodeURIComponent(specialization)}&location=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = data.map(doctor =>
                `<div class="doctor">
                    <h3>${doctor.name}</h3>
                    <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                    <p><strong>Location:</strong> ${doctor.location}</p>
                    <p><strong>Experience:</strong> ${doctor.experience_years} years</p>
                    <p><strong>Contact:</strong> ${doctor.contact_info}</p>
                </div>`
            ).join('') || '<p>No doctors found.</p>';
        });
});

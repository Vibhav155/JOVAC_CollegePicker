function toggleMenu() {
    var nav = document.querySelector('header nav');
    nav.classList.toggle('open');
}

function toggleFilters() {
    const fi = document.querySelector('.fi');
    fi.classList.toggle('open');
}

function startSearch() {
    window.location.href = 'filter.html';
}

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
};

let observer;

document.addEventListener('DOMContentLoaded', () => {
    observer = new IntersectionObserver(observerCallback, observerOptions);
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(element => observer.observe(element));


    fetchColleges();
});

let allColleges = [];
let filteredColleges = [];
let displayedCount = 0;
const increment = 10;

function fetchColleges() {
    console.log('Fetching colleges');
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';

    fetch('http://localhost:3800/colleges')
        .then(response => {
            console.log('Response received:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched colleges:', data);
            loadingSpinner.style.display = 'none';
            allColleges = removeDuplicates(data);
            filteredColleges = [...allColleges];
            displayColleges();
        })
        .catch(error => {
            loadingSpinner.style.display = 'none';
            console.error('Error fetching colleges:', error);
        });
}

function removeDuplicates(colleges) {
    const uniqueColleges = [];
    const seen = new Set();
    colleges.forEach(college => {
        if (!seen.has(college['College Name'])) {
            seen.add(college['College Name']);
            uniqueColleges.push(college);
        }
    });
    return uniqueColleges;
}

function displayColleges() {
    console.log('Displaying colleges:', filteredColleges);
    const collegeList = document.getElementById('collegeList');
    const loadMoreButton = document.getElementById('loadMoreButton');

    if (displayedCount === 0) {
        collegeList.innerHTML = '';
    }

    const collegesToDisplay = filteredColleges.slice(displayedCount, displayedCount + increment);
    collegesToDisplay.forEach(college => {
        const collegeCard = document.createElement('div');
        collegeCard.classList.add('college-card', 'hidden');

        collegeCard.dataset.location = college['City'] || '';
        collegeCard.dataset.rating = college['Rating'] || '';
        collegeCard.dataset.type = college['College Type'] || '';
        collegeCard.dataset.fee = college['Average Fees'] || '0';

        collegeCard.innerHTML = `
            <h3>${college['College Name']}</h3>
            <button class="details-btn">Details</button>
            <div class="details" style="display: none;">
                <p><strong>Campus Size:</strong> ${college['Campus Size']}</p>
                <p><strong>Total Student Enrollments:</strong> ${college['Total Student Enrollments']}</p>
                <p><strong>Total Faculty:</strong> ${college['Total Faculty']}</p>
                <p><strong>Established Year:</strong> ${college['Established Year']}</p>
                <p><strong>Rating:</strong> ${college['Rating']}</p>
                <p><strong>University:</strong> ${college['University']}</p>
                <p><strong>Courses:</strong> ${college['Courses'] ? college['Courses'].join(', ') : 'N/A'}</p>
                <p><strong>Facilities:</strong> ${college['Facilities'] ? college['Facilities'].join(', ') : 'N/A'}</p>
                <p><strong>City:</strong> ${college['City']}</p>
                <p><strong>State:</strong> ${college['State']}</p>
                <p><strong>Country:</strong> ${college['Country']}</p>
                <p><strong>College Type:</strong> ${college['College Type']}</p>
                <p><strong>Average Fees:</strong> ${college['Average Fees']}</p>
            </div>
        `;

        collegeList.appendChild(collegeCard);

        const detailsButton = collegeCard.querySelector('.details-btn');
        const detailsDiv = collegeCard.querySelector('.details');
        detailsButton.addEventListener('click', () => {
            const isVisible = detailsDiv.style.display === 'block';
            detailsDiv.style.display = isVisible ? 'none' : 'block';
        });

        observer.observe(collegeCard);
    });

    displayedCount += increment;

    if (displayedCount >= filteredColleges.length) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'block';
    }
}

document.getElementById('feeRange').addEventListener('input', (event) => {
    const feeValue = document.getElementById('feeValue');
    feeValue.textContent = `0 - ₹${event.target.value}`;
});

function filterColleges() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const stateFilter = document.getElementById('stateFilter').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value.toLowerCase();
    const feeRange = document.getElementById('feeRange').value;
    const ratingFilter = document.getElementById('ratingFilter').value;

    filteredColleges = allColleges.filter(college => {
        const collegeName = (college['College Name'] || '').toLowerCase();
        const collegeState = (college['State'] || '').toLowerCase();
        const collegeType = (college['College Type'] || '').toLowerCase();
        const collegeFee = college['Average Fees'] || '0';
        const collegeRating = parseFloat(college['Rating'] || '0');

        const matchesSearch = collegeName.includes(searchInput);
        const matchesState = !stateFilter || collegeState.includes(stateFilter);
        const matchesType = !typeFilter || collegeType.includes(typeFilter);
        const matchesFee = parseInt(collegeFee) <= parseInt(feeRange);
        const matchesRating = !ratingFilter || (collegeRating >= parseFloat(ratingFilter) && collegeRating < (parseFloat(ratingFilter) + 1));

        return matchesSearch && matchesState && matchesType && matchesFee && matchesRating;
    });

    displayedCount = 0;
    displayColleges();
}

document.getElementById('searchInput').addEventListener('input', filterColleges);
document.getElementById('stateFilter').addEventListener('change', filterColleges);
document.getElementById('typeFilter').addEventListener('change', filterColleges);
document.getElementById('feeRange').addEventListener('input', filterColleges);
document.getElementById('ratingFilter').addEventListener('change', filterColleges);

document.getElementById('loadMoreButton').addEventListener('click', () => {
    displayColleges();
});

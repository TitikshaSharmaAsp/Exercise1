document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class='participants-section'>
            <p><strong>Current Participants:</strong></p>
            ${details.participants.length > 0 ?
              `<ul class='participants-list'>
                ${details.participants.map(participant => `<li>${participant}</li>`).join('')}
              </ul>`
              : '<p class="no-participants">No participants yet</p>'
            }
          </div>
        `;
        // Update the participant list HTML generation in the fetchActivities function
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class='participants-section'>
          <p><strong>Current Participants:</strong></p>
          ${details.participants.length > 0 ?
            `<ul class='participants-list'>
              ${details.participants.map(participant => `
                <li data-activity="${name}" data-email="${participant}">
                  <span class="participant-email">${participant}</span>
                  <button class="delete-btn" title="Unregister participant">×</button>
                </li>
              `).join('')}
            </ul>`
            : '<p class="no-participants">No participants yet</p>'
          }
          </div>
        `;
        
        // Add event listener for delete buttons after creating the activity card
        activityCard.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
          const li = e.target.parentElement;
          const activity = li.dataset.activity;
          const email = li.dataset.email;
        
          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
              {
                method: 'DELETE'
              }
            );
        
            if (response.ok) {
              // Remove the list item and update the spots count
              li.remove();
              const spotsCountEl = activityCard.querySelector('p:nth-child(3)');
              const currentSpots = parseInt(spotsCountEl.textContent.match(/\d+/)[0]);
              spotsCountEl.innerHTML = `<strong>Availability:</strong> ${currentSpots + 1} spots left`;
        
              // Show success message
              messageDiv.textContent = `Successfully unregistered ${email} from ${activity}`;
              messageDiv.className = "success";
              messageDiv.classList.remove("hidden");
        
              // If no participants left, show the "No participants" message
              const participantsList = activityCard.querySelector('.participants-list');
              if (participantsList && participantsList.children.length === 0) {
                participantsList.parentElement.innerHTML = '<p class="no-participants">No participants yet</p>';
              }
            } else {
              const error = await response.json();
              messageDiv.textContent = error.detail || "Failed to unregister participant";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
            }
        
            // Hide message after 5 seconds
            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);
        
          } catch (error) {
            console.error("Error unregistering participant:", error);
            messageDiv.textContent = "Failed to unregister participant. Please try again.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
          }
          });
        });        
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

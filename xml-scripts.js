$(document).ready(function () {
  // Load quotes for homepage and pricing pages
  if ($('#carouselExampleControls').length) {
    loadQuotesXML();
  }

  // Load popular tutorials for homepage
  if ($('#carouselExampleControls2').length) {
    loadPopularTutorialsXML();
  }

  // Load latest videos for homepage
  if ($('#carouselExampleControls3').length) {
    loadLatestVideosXML();
  }

  // Load courses for courses page
  if ($('.courses-list').length || $('.section.search').length) {
    loadCoursesXML();
  }
});

/**
 * Load quotes from XML API and populate carousel
 */
function loadQuotesXML() {
  const $carousel = $('#carouselExampleControls .carousel-inner');

  // Show loader
  $carousel.html('<div class="loader"></div>');

  $.ajax({
    url: 'https://smileschool-api.hbtn.info/xml/quotes',
    method: 'GET',
    dataType: 'xml',
    success: function (xml) {
      $carousel.empty();

      $(xml).find('quote').each(function (index) {
        const activeClass = index === 0 ? 'active' : '';
        const picUrl = $(this).find('pic_url').text();
        const text = $(this).find('text').text();
        const name = $(this).find('name').text();
        const title = $(this).find('title').text();

        const quoteHTML = `
          <div class="carousel-item ${activeClass}">
            <div class="row mx-auto align-items-center">
              <div class="col-12 col-sm-2 col-lg-2 offset-lg-1 text-center">
                <img
                  src="${picUrl}"
                  class="d-block align-self-center"
                  alt="${name}"
                />
              </div>
              <div class="col-12 col-sm-7 offset-sm-2 col-lg-9 offset-lg-0">
                <div class="quote-text">
                  <p class="text-white">« ${text}</p>
                  <h4 class="text-white font-weight-bold">${name}</h4>
                  <span class="text-white">${title}</span>
                </div>
              </div>
            </div>
          </div>
        `;
        $carousel.append(quoteHTML);
      });
    },
    error: function () {
      $carousel.html('<p class="text-white text-center">Error loading quotes</p>');
    }
  });
}

/**
 * Load popular tutorials from XML API and populate carousel
 */
function loadPopularTutorialsXML() {
  const $carousel = $('#carouselExampleControls2 .carousel-inner');

  // Show loader
  $carousel.html('<div class="loader"></div>');

  $.ajax({
    url: 'https://smileschool-api.hbtn.info/xml/popular-tutorials',
    method: 'GET',
    dataType: 'xml',
    success: function (xml) {
      $carousel.empty();

      const videos = [];
      $(xml).find('video').each(function () {
        videos.push({
          thumb_url: $(this).find('thumb_url').text(),
          title: $(this).find('title').text(),
          'sub-title': $(this).find('sub-title').text(),
          author_pic_url: $(this).find('author_pic_url').text(),
          author: $(this).find('author').text(),
          star: parseInt($(this).find('star').text()),
          duration: $(this).find('duration').text()
        });
      });

      // Group videos into slides of 4 (1 for mobile, 2 for tablet, 4 for desktop)
      const slidesCount = Math.ceil(videos.length / 4);

      for (let i = 0; i < slidesCount; i++) {
        const activeClass = i === 0 ? 'active' : '';
        const startIndex = i * 4;
        const endIndex = Math.min(startIndex + 4, videos.length);
        const slideVideos = videos.slice(startIndex, endIndex);

        let cardsHTML = '';
        slideVideos.forEach(function (video, index) {
          const visibilityClasses = getCardVisibilityClasses(index);
          cardsHTML += createVideoCard(video, visibilityClasses);
        });

        const slideHTML = `
          <div class="carousel-item ${activeClass}">
            <div class="row align-items-center mx-auto">
              ${cardsHTML}
            </div>
          </div>
        `;
        $carousel.append(slideHTML);
      }
    },
    error: function () {
      $carousel.html('<p class="text-center">Error loading tutorials</p>');
    }
  });
}

/**
 * Load latest videos from XML API and populate carousel
 */
function loadLatestVideosXML() {
  const $carousel = $('#carouselExampleControls3 .carousel-inner');

  // Show loader
  $carousel.html('<div class="loader"></div>');

  $.ajax({
    url: 'https://smileschool-api.hbtn.info/xml/latest-videos',
    method: 'GET',
    dataType: 'xml',
    success: function (xml) {
      $carousel.empty();

      const videos = [];
      $(xml).find('video').each(function () {
        videos.push({
          thumb_url: $(this).find('thumb_url').text(),
          title: $(this).find('title').text(),
          'sub-title': $(this).find('sub-title').text(),
          author_pic_url: $(this).find('author_pic_url').text(),
          author: $(this).find('author').text(),
          star: parseInt($(this).find('star').text()),
          duration: $(this).find('duration').text()
        });
      });

      // Group videos into slides of 4 (1 for mobile, 2 for tablet, 4 for desktop)
      const slidesCount = Math.ceil(videos.length / 4);

      for (let i = 0; i < slidesCount; i++) {
        const activeClass = i === 0 ? 'active' : '';
        const startIndex = i * 4;
        const endIndex = Math.min(startIndex + 4, videos.length);
        const slideVideos = videos.slice(startIndex, endIndex);

        let cardsHTML = '';
        slideVideos.forEach(function (video, index) {
          const visibilityClasses = getCardVisibilityClasses(index);
          cardsHTML += createVideoCard(video, visibilityClasses);
        });

        const slideHTML = `
          <div class="carousel-item ${activeClass}">
            <div class="row align-items-center mx-auto">
              ${cardsHTML}
            </div>
          </div>
        `;
        $carousel.append(slideHTML);
      }
    },
    error: function () {
      $carousel.html('<p class="text-center">Error loading videos</p>');
    }
  });
}

/**
 * Load courses from XML API with filters
 */
function loadCoursesXML() {
  const $coursesList = $('.courses-list, .list-courses');
  const $searchInput = $('.search-text-area');
  const $topicDropdown = $('.dropdown').eq(0);
  const $sortDropdown = $('.dropdown').eq(1);

  let searchQuery = '';
  let topicFilter = '';
  let sortFilter = '';

  // Initialize dropdowns with API data
  initializeFilters();

  // Fetch courses on page load
  fetchCourses();

  // Event listeners for filters
  $searchInput.on('input', function () {
    searchQuery = $(this).val();
    fetchCourses();
  });

  $topicDropdown.find('.dropdown-item').on('click', function (e) {
    e.preventDefault();
    topicFilter = $(this).data('value') || '';
    $topicDropdown.find('.btn').text($(this).text());
    fetchCourses();
  });

  $sortDropdown.find('.dropdown-item').on('click', function (e) {
    e.preventDefault();
    sortFilter = $(this).data('value') || '';
    $sortDropdown.find('.btn').text($(this).text());
    fetchCourses();
  });

  /**
   * Initialize filter dropdowns from XML API
   */
  function initializeFilters() {
    $.ajax({
      url: 'https://smileschool-api.hbtn.info/xml/courses',
      method: 'GET',
      dataType: 'xml',
      data: { q: '', topic: '', sort: '' },
      success: function (xml) {
        // Populate topics dropdown
        const topics = [];
        $(xml).find('topics topic').each(function () {
          topics.push($(this).text());
        });

        if (topics.length > 0) {
          const $topicMenu = $topicDropdown.find('.dropdown-menu');
          $topicMenu.empty();
          $topicMenu.append('<a class="dropdown-item" href="#" data-value="">All</a>');
          topics.forEach(function (topic) {
            $topicMenu.append(`<a class="dropdown-item" href="#" data-value="${topic}">${topic}</a>`);
          });

          // Re-attach event listeners
          $topicMenu.find('.dropdown-item').on('click', function (e) {
            e.preventDefault();
            topicFilter = $(this).data('value') || '';
            $topicDropdown.find('.btn').text($(this).text());
            fetchCourses();
          });
        }

        // Populate sorts dropdown
        const sorts = [];
        $(xml).find('sorts sort').each(function () {
          sorts.push($(this).text());
        });

        if (sorts.length > 0) {
          const $sortMenu = $sortDropdown.find('.dropdown-menu');
          $sortMenu.empty();
          sorts.forEach(function (sort) {
            $sortMenu.append(`<a class="dropdown-item" href="#" data-value="${sort}">${sort}</a>`);
          });

          // Re-attach event listeners
          $sortMenu.find('.dropdown-item').on('click', function (e) {
            e.preventDefault();
            sortFilter = $(this).data('value') || '';
            $sortDropdown.find('.btn').text($(this).text());
            fetchCourses();
          });
        }

        // Set initial search value
        const q = $(xml).find('q').text();
        if (q) {
          $searchInput.val(q);
          searchQuery = q;
        }
      }
    });
  }

  /**
   * Fetch courses based on current filters
   */
  function fetchCourses() {
    // Show loader
    $coursesList.html('<div class="loader"></div>');

    $.ajax({
      url: 'https://smileschool-api.hbtn.info/xml/courses',
      method: 'GET',
      dataType: 'xml',
      data: {
        q: searchQuery,
        topic: topicFilter,
        sort: sortFilter
      },
      success: function (xml) {
        $coursesList.empty();

        // Update search keywords if provided
        const q = $(xml).find('q').text();
        if (q !== undefined) {
          $searchInput.val(q);
        }

        const courses = [];
        $(xml).find('courses course').each(function () {
          courses.push({
            thumb_url: $(this).find('thumb_url').text(),
            title: $(this).find('title').text(),
            'sub-title': $(this).find('sub-title').text(),
            author_pic_url: $(this).find('author_pic_url').text(),
            author: $(this).find('author').text(),
            star: parseInt($(this).find('star').text()),
            duration: $(this).find('duration').text()
          });
        });

        // Display number of videos
        $('.videos-count').text(`${courses.length} videos`);

        // Create course cards
        if (courses.length === 0) {
          $coursesList.html('<p class="text-center">No courses found</p>');
        } else {
          const coursesHTML = courses.map(function (course) {
            return createCourseCard(course);
          }).join('');
          $coursesList.html(coursesHTML);
        }
      },
      error: function () {
        $coursesList.html('<p class="text-center">Error loading courses</p>');
      }
    });
  }

  /**
   * Create a course card HTML
   */
  function createCourseCard(course) {
    const stars = createStars(course.star);
    return `
      <div class="col-12 col-sm-6 col-md-6 col-lg-3 d-flex justify-content-center">
        <div class="card">
          <img
            src="${course['thumb_url']}"
            class="card-img-top"
            alt="${course.title}"
          />
          <div class="card-img-overlay text-center">
            <img
              src="images/play.png"
              alt="Play"
              width="64px"
              class="align-self-center play-overlay"
            />
          </div>
          <div class="card-body">
            <h5 class="card-title font-weight-bold">${course.title}</h5>
            <p class="card-text text-muted">${course['sub-title']}</p>
            <div class="creator d-flex align-items-center">
              <img
                src="${course.author_pic_url}"
                alt="${course.author}"
                width="30px"
                class="rounded-circle"
              />
              <h6 class="pl-3 m-0 main-color">${course.author}</h6>
            </div>
            <div class="info pt-3 d-flex justify-content-between">
              <div class="rating">${stars}</div>
              <span class="main-color">${course.duration}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Create video card HTML
 */
function createVideoCard(video, visibilityClasses = '') {
  const stars = createStars(video.star);
  return `
    <div class="${visibilityClasses} d-flex justify-content-center">
      <div class="card">
        <img
          src="${video['thumb_url']}"
          class="card-img-top"
          alt="${video.title}"
        />
        <div class="card-img-overlay text-center">
          <img
            src="images/play.png"
            alt="Play"
            width="64px"
            class="align-self-center play-overlay"
          />
        </div>
        <div class="card-body">
          <h5 class="card-title font-weight-bold">${video.title}</h5>
          <p class="card-text text-muted">${video['sub-title']}</p>
          <div class="creator d-flex align-items-center">
            <img
              src="${video.author_pic_url}"
              alt="${video.author}"
              width="30px"
              class="rounded-circle"
            />
            <h6 class="pl-3 m-0 main-color">${video.author}</h6>
          </div>
          <div class="info pt-3 d-flex justify-content-between">
            <div class="rating">${stars}</div>
            <span class="main-color">${video.duration}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create stars HTML based on rating
 */
function createStars(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHTML += '<img src="images/star_on.png" alt="star on" width="15px" />';
    } else {
      starsHTML += '<img src="images/star_off.png" alt="star off" width="15px" />';
    }
  }
  return starsHTML;
}

/**
 * Get visibility classes for card based on index
 */
function getCardVisibilityClasses(index) {
  if (index === 0) {
    return 'col-12 col-sm-6 col-md-6 col-lg-3 justify-content-center justify-content-md-end justify-content-lg-center';
  } else if (index === 1) {
    return 'col-sm-6 col-md-6 col-lg-3 d-none d-sm-flex justify-content-md-start justify-content-lg-center';
  } else if (index === 2) {
    return 'col-md-6 col-lg-3 d-none d-md-flex justify-content-md-end justify-content-lg-center';
  } else {
    return 'col-lg-3 d-none d-lg-flex justify-content-lg-center';
  }
}

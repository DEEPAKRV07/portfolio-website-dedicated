// Authored node identities/topology extracted from the preserved V2 GLBs.
export const LEGACY_GRAPH = {
  "home": {
    "nodes": [
      {
        "id": "about",
        "position": [
          -4.800000190734863,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "contact",
        "position": [
          4.800000190734863,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "experience",
        "position": [
          2.4000000953674316,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "hero",
        "position": [
          0,
          0,
          0
        ]
      },
      {
        "id": "projects",
        "position": [
          0,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "skills",
        "position": [
          -2.4000000953674316,
          -3.200000047683716,
          0
        ]
      }
    ],
    "edges": [
      [
        "hero",
        "about"
      ],
      [
        "hero",
        "contact"
      ],
      [
        "hero",
        "experience"
      ],
      [
        "hero",
        "projects"
      ],
      [
        "hero",
        "skills"
      ]
    ],
    "duration": 3.125
  },
  "projects": {
    "nodes": [
      {
        "id": "football-analysis",
        "position": [
          3.6500000953674316,
          -3.450000047683716,
          0.05999999865889549
        ]
      },
      {
        "id": "forcrux",
        "position": [
          -4.400000095367432,
          2.0999999046325684,
          0.05999999865889549
        ]
      },
      {
        "id": "google-maps",
        "position": [
          4.400000095367432,
          2.0999999046325684,
          -0.05999999865889549
        ]
      },
      {
        "id": "kaatchi-media",
        "position": [
          0,
          4.699999809265137,
          -0.05000000074505806
        ]
      },
      {
        "id": "projects_root",
        "position": [
          0,
          0,
          0
        ]
      },
      {
        "id": "sightmate",
        "position": [
          -3.6500000953674316,
          -3.450000047683716,
          -0.05999999865889549
        ]
      }
    ],
    "edges": [
      [
        "football-analysis",
        "sightmate"
      ],
      [
        "forcrux",
        "kaatchi-media"
      ],
      [
        "google-maps",
        "football-analysis"
      ],
      [
        "kaatchi-media",
        "google-maps"
      ],
      [
        "projects_root",
        "football-analysis"
      ],
      [
        "projects_root",
        "forcrux"
      ],
      [
        "projects_root",
        "google-maps"
      ],
      [
        "projects_root",
        "kaatchi-media"
      ],
      [
        "projects_root",
        "sightmate"
      ],
      [
        "sightmate",
        "forcrux"
      ]
    ],
    "duration": 2.375
  },
  "skills": {
    "nodes": [
      {
        "id": "bytetrack",
        "position": [
          -5.050000190734863,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      },
      {
        "id": "concurrency",
        "position": [
          1.0499999523162842,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "cv-category",
        "position": [
          -6,
          1.7000000476837158,
          -0.05000000074505806
        ]
      },
      {
        "id": "dl-category",
        "position": [
          -2,
          1.7000000476837158,
          -0.05000000074505806
        ]
      },
      {
        "id": "fast-scnn",
        "position": [
          -5.050000190734863,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "flutter",
        "position": [
          6.949999809265137,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      },
      {
        "id": "git",
        "position": [
          6.949999809265137,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "kmeans",
        "position": [
          -1.0499999523162842,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "lang-category",
        "position": [
          6,
          1.7000000476837158,
          -0.05000000074505806
        ]
      },
      {
        "id": "ml-kit",
        "position": [
          -2.950000047683716,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "nextjs",
        "position": [
          5.050000190734863,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "opencv",
        "position": [
          -6.949999809265137,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "pandas",
        "position": [
          2.950000047683716,
          -2.950000047683716,
          -0.019999999552965164
        ]
      },
      {
        "id": "playwright",
        "position": [
          1.0499999523162842,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      },
      {
        "id": "python",
        "position": [
          5.050000190734863,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      },
      {
        "id": "pytorch",
        "position": [
          -2.950000047683716,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      },
      {
        "id": "skills_root",
        "position": [
          0,
          5.099999904632568,
          -0.30000001192092896
        ]
      },
      {
        "id": "sqlite",
        "position": [
          2.950000047683716,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      },
      {
        "id": "systems-category",
        "position": [
          2,
          1.7000000476837158,
          -0.05000000074505806
        ]
      },
      {
        "id": "tensorflow",
        "position": [
          -1.0499999523162842,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      },
      {
        "id": "yolov8",
        "position": [
          -6.949999809265137,
          -1.0499999523162842,
          -0.019999999552965164
        ]
      }
    ],
    "edges": [
      [
        "cv-category",
        "bytetrack"
      ],
      [
        "cv-category",
        "fast-scnn"
      ],
      [
        "cv-category",
        "opencv"
      ],
      [
        "cv-category",
        "yolov8"
      ],
      [
        "dl-category",
        "kmeans"
      ],
      [
        "dl-category",
        "ml-kit"
      ],
      [
        "dl-category",
        "pytorch"
      ],
      [
        "dl-category",
        "tensorflow"
      ],
      [
        "lang-category",
        "flutter"
      ],
      [
        "lang-category",
        "git"
      ],
      [
        "lang-category",
        "nextjs"
      ],
      [
        "lang-category",
        "python"
      ],
      [
        "skills_root",
        "cv-category"
      ],
      [
        "skills_root",
        "dl-category"
      ],
      [
        "skills_root",
        "lang-category"
      ],
      [
        "skills_root",
        "systems-category"
      ],
      [
        "systems-category",
        "concurrency"
      ],
      [
        "systems-category",
        "pandas"
      ],
      [
        "systems-category",
        "playwright"
      ],
      [
        "systems-category",
        "sqlite"
      ]
    ],
    "duration": 5.166666666666667
  },
  "experience": {
    "nodes": [
      {
        "id": "experience_root",
        "position": [
          0,
          0,
          0
        ]
      },
      {
        "id": "forcrux-exp",
        "position": [
          -10.800000190734863,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "kaatchi-exp",
        "position": [
          -3.5999999046325684,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "msme-exp",
        "position": [
          3.5999999046325684,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "quality-exp",
        "position": [
          10.800000190734863,
          -3.200000047683716,
          0
        ]
      }
    ],
    "edges": [
      [
        "experience_root",
        "forcrux-exp"
      ],
      [
        "experience_root",
        "kaatchi-exp"
      ],
      [
        "experience_root",
        "msme-exp"
      ],
      [
        "experience_root",
        "quality-exp"
      ]
    ],
    "duration": 2.7916666666666665
  },
  "education": {
    "nodes": [
      {
        "id": "education_root",
        "position": [
          0,
          0,
          0
        ]
      },
      {
        "id": "sa_engineering_college",
        "position": [
          0,
          -3.200000047683716,
          0
        ]
      }
    ],
    "edges": [
      [
        "education_root",
        "sa_engineering_college"
      ]
    ],
    "duration": 2.0416666666666665
  },
  "contact": {
    "nodes": [
      {
        "id": "contact_email",
        "position": [
          -3.5999999046325684,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "contact_github",
        "position": [
          1.2000000476837158,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "contact_linkedin",
        "position": [
          -1.2000000476837158,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "contact_resume",
        "position": [
          3.5999999046325684,
          -3.200000047683716,
          0
        ]
      },
      {
        "id": "contact_root",
        "position": [
          0,
          0,
          0
        ]
      }
    ],
    "edges": [
      [
        "contact_root",
        "contact_email"
      ],
      [
        "contact_root",
        "contact_github"
      ],
      [
        "contact_root",
        "contact_linkedin"
      ],
      [
        "contact_root",
        "contact_resume"
      ]
    ],
    "duration": 3.0416666666666665
  }
};
